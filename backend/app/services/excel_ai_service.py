import json
import re
from typing import Any, Dict, List, Optional, Tuple

from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.utils.cell import range_boundaries
from openpyxl.utils import get_column_letter

from app.core.config import settings

try:
    from google import genai as google_genai
except ImportError:  # pragma: no cover
    google_genai = None


EXCEL_AGENT_SYSTEM_PROMPT = """You are an expert Excel AI assistant. You receive structured spreadsheet data and a data summary (columns, row count, sample rows).

Your job: understand the user request and return a STRICT JSON response that modifies, analyzes, or creates dashboards/charts for the spreadsheet.

RESPONSE FORMAT — return ONLY this JSON, nothing else:
{
  "explanation": "Detailed plain-English explanation of every action taken and insight found",
  "changes": [
    {"sheet": "Sheet1", "cell": "A1", "value": "text or number", "formula": "=SUM(B2:B100)"}
  ],
  "charts": [
    {"type": "bar", "title": "Sales by Region", "dataRange": "H1:I6", "sheet": "Sheet1", "position": "K2"}
  ],
  "dashboard": {
    "create": true,
    "sheetName": "Dashboard",
    "elements": [
      {"type": "metric", "label": "Total Records", "valueCell": "H2", "valueFormula": "=COUNTA(A:A)-1"},
      {"type": "metric", "label": "Unique Areas", "valueCell": "H3", "valueFormula": "=SUMPRODUCT(1/COUNTIF(A2:A100,A2:A100))"},
      {"type": "chart", "chartRef": 0}
    ]
  },
  "readOnly": false
}

RULES:
1. ALWAYS return STRICT JSON only — no markdown, no text outside the JSON object.
2. If the user only asks a question (no edits needed): set "readOnly": true, keep changes/charts empty, and put the full answer in "explanation".
3. NEVER delete data unless explicitly asked.
4. Prefer Excel formulas (=SUM, =COUNTA, =COUNTIF, =AVERAGE, =IF, =VLOOKUP, etc.) over static values.
5. Be precise with cell references — use the actual data range from the data summary provided.

DASHBOARD AND CHART RULES (critical):
6. When asked for a dashboard, you MUST:
   a. First add summary/aggregation cells to a free area of the source sheet (e.g. column H onwards). Use formulas like =COUNTA, =COUNTIF, =SUMPRODUCT for KPIs.
   b. For charts: create a small summary table in the source sheet (e.g. H1:I6 with category labels in H and counts in I using =COUNTIF). Then set the chart's dataRange to that summary table range.
   c. Set dashboard.create=true and reference those summary cells as metric elements.
   d. Include at least 2 charts (bar + pie or bar + line) and at least 3 KPI metrics.
7. Chart dataRange MUST reference cells that contain actual data or formulas — never reference empty cells.
8. For a bar/pie chart showing distribution, first build a frequency table with =COUNTIF, then point the chart at that table.
9. Dashboard metrics should use valueFormula (the formula to write in the source sheet) and valueCell (where to write it).
10. Put long, detailed insights in "explanation" — describe what the data shows, patterns found, and what the dashboard visualizes.
"""


class ExcelAIService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY and google_genai is not None:
            self.client = google_genai.Client(api_key=settings.GEMINI_API_KEY)

    @staticmethod
    def workbook_to_sheet_json(
        workbook: Workbook,
        max_cells: int = 2000,
        max_rows_per_sheet: int = 200,
        max_cols_per_sheet: int = 40,
    ) -> Dict[str, Dict[str, Dict[str, Any]]]:
        out: Dict[str, Dict[str, Dict[str, Any]]] = {}
        written = 0
        for ws in workbook.worksheets:
            out[ws.title] = {}
            max_row = min(ws.max_row or 1, max_rows_per_sheet)
            max_col = min(ws.max_column or 1, max_cols_per_sheet)
            for row in ws.iter_rows(min_row=1, max_row=max_row, min_col=1, max_col=max_col):
                for cell in row:
                    val = cell.value
                    if val is None:
                        continue
                    entry = {
                        "value": val if not isinstance(val, bytes) else str(val),
                        "formula": val if isinstance(val, str) and val.startswith("=") else None,
                    }
                    out[ws.title][cell.coordinate] = entry
                    written += 1
                    if written >= max_cells:
                        return out
        return out

    @staticmethod
    def _build_data_summary(sheet_json: Dict[str, Any]) -> str:
        """Build a concise data summary for Gemini: columns, row count, sample rows, and free column."""
        parts: List[str] = []
        for sheet_name, cells in sheet_json.items():
            if not cells:
                continue
            max_row = 0
            max_col = 0
            headers: Dict[int, str] = {}
            sample_rows: Dict[int, Dict[int, Any]] = {}
            for cell_ref, cell_data in cells.items():
                m = re.match(r"^([A-Z]+)(\d+)$", cell_ref)
                if not m:
                    continue
                col_idx = 0
                for ch in m.group(1):
                    col_idx = col_idx * 26 + (ord(ch) - 64)
                row_idx = int(m.group(2))
                max_row = max(max_row, row_idx)
                max_col = max(max_col, col_idx)
                val = cell_data.get("value")
                if row_idx == 1:
                    headers[col_idx] = str(val) if val is not None else ""
                elif row_idx <= 4:
                    sample_rows.setdefault(row_idx, {})[col_idx] = val

            col_names = [headers.get(c, f"Col{c}") for c in sorted(headers.keys())]
            free_col = get_column_letter(max_col + 1) if max_col else "H"
            parts.append(
                f"Sheet '{sheet_name}': {max_row - 1} data rows, {max_col} columns.\n"
                f"Columns: {col_names}\n"
                f"Data range: A1:{get_column_letter(max_col)}{max_row}\n"
                f"Free column for helper data: {free_col} onwards"
            )
            for r in sorted(sample_rows.keys()):
                row_vals = [str(sample_rows[r].get(c, "")) for c in sorted(headers.keys())]
                parts.append(f"  Row {r}: {row_vals}")
        return "\n".join(parts) if parts else "Empty spreadsheet."

    @staticmethod
    def _extract_json(text: str) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        candidate = text.strip()
        if candidate.startswith("```"):
            candidate = re.sub(r"^```(?:json)?\s*", "", candidate)
            candidate = re.sub(r"\s*```$", "", candidate).strip()
        try:
            if candidate.startswith("{"):
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    return parsed
        except json.JSONDecodeError:
            pass
        match = re.search(r"(\{[\s\S]*\})", text)
        if not match:
            return None
        try:
            parsed = json.loads(match.group(1))
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None

    def _gemini_generate_json(
        self,
        user_message: str,
        sheet_json: Dict[str, Any],
    ) -> Dict[str, Any]:
        if not self.client:
            raise RuntimeError("Gemini is not configured. Please set GEMINI_API_KEY.")
        data_summary = self._build_data_summary(sheet_json)
        prompt = (
            f"{EXCEL_AGENT_SYSTEM_PROMPT}\n\n"
            f"DATA SUMMARY:\n{data_summary}\n\n"
            f"User request:\n{user_message}\n\n"
            f"Spreadsheet JSON:\n{json.dumps(sheet_json, default=str)[:250000]}"
        )
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        parsed = self._extract_json(getattr(response, "text", ""))
        if parsed:
            return parsed

        retry_prompt = (
            f"{prompt}\n\nYou did not return valid JSON. RETURN ONLY the JSON object, no markdown, no text."
        )
        retry_response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=retry_prompt,
        )
        parsed_retry = self._extract_json(getattr(retry_response, "text", ""))
        if parsed_retry:
            return parsed_retry
        raise RuntimeError("Gemini returned invalid JSON twice.")

    @staticmethod
    def _normalize_response(raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "explanation": str(raw.get("explanation", "Processed request successfully.")),
            "changes": raw.get("changes") if isinstance(raw.get("changes"), list) else [],
            "charts": raw.get("charts") if isinstance(raw.get("charts"), list) else [],
            "dashboard": raw.get("dashboard") if isinstance(raw.get("dashboard"), dict) else {"create": False},
            "readOnly": bool(raw.get("readOnly", False)),
        }

    @staticmethod
    def _ensure_sheet(workbook: Workbook, sheet_name: str):
        if sheet_name in workbook.sheetnames:
            return workbook[sheet_name]
        return workbook.create_sheet(title=sheet_name)

    @staticmethod
    def _build_chart(chart_cfg: Dict[str, Any], ws) -> Optional[Any]:
        chart_type = str(chart_cfg.get("type", "bar")).lower()
        data_range = str(chart_cfg.get("dataRange", "")).strip()
        if not data_range:
            return None
        try:
            min_col, min_row, max_col, max_row = range_boundaries(data_range)
        except Exception:
            return None
        if max_row <= min_row:
            return None

        if chart_type == "line":
            chart = LineChart()
        elif chart_type == "pie":
            chart = PieChart()
        else:
            chart = BarChart()
        chart.title = str(chart_cfg.get("title", "Chart"))

        data_ref = Reference(ws, min_col=min_col + 1 if (max_col - min_col) >= 1 else min_col, min_row=min_row, max_col=max_col, max_row=max_row)
        chart.add_data(data_ref, titles_from_data=True)
        if (max_col - min_col) >= 1:
            categories = Reference(ws, min_col=min_col, min_row=min_row + 1, max_row=max_row)
            chart.set_categories(categories)
        return chart

    def apply_plan_to_workbook(
        self,
        workbook: Workbook,
        ai_plan: Dict[str, Any],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
        changes_log: List[Dict[str, Any]] = []
        charts_created: List[Dict[str, Any]] = []
        dashboard_summary: Dict[str, Any] = {"created": False, "sheet": None, "elements": 0}
        dashboard_kpis: List[Dict[str, Any]] = []

        for change in ai_plan.get("changes", []):
            sheet_name = str(change.get("sheet", "Sheet1"))
            cell_ref = str(change.get("cell", "")).strip()
            if not cell_ref:
                continue
            ws = self._ensure_sheet(workbook, sheet_name)
            before = ws[cell_ref].value
            if change.get("formula"):
                ws[cell_ref].value = str(change["formula"])
            elif "value" in change:
                ws[cell_ref].value = change.get("value")
            after = ws[cell_ref].value
            changes_log.append({
                "sheet": sheet_name,
                "cell": cell_ref,
                "before": before,
                "after": after,
            })

        for idx, chart_cfg in enumerate(ai_plan.get("charts", [])):
            sheet_name = str(chart_cfg.get("sheet", "Sheet1"))
            ws = self._ensure_sheet(workbook, sheet_name)
            chart_obj = self._build_chart(chart_cfg, ws)
            if chart_obj is None:
                continue
            position = str(chart_cfg.get("position", "E5"))
            ws.add_chart(chart_obj, position)
            charts_created.append({
                "index": idx,
                "sheet": sheet_name,
                "title": str(chart_cfg.get("title", "Chart")),
                "type": str(chart_cfg.get("type", "bar")),
                "position": position,
            })

        dashboard = ai_plan.get("dashboard", {}) or {}
        if dashboard.get("create"):
            dash_name = str(dashboard.get("sheetName", "Dashboard")).strip() or "Dashboard"
            dash_ws = self._ensure_sheet(workbook, dash_name)
            dash_ws["A1"] = "AI Dashboard"
            dash_ws["A2"] = "Generated summary metrics and chart references"
            row_idx = 4
            source_sheet = workbook.sheetnames[0]
            for element in dashboard.get("elements", []):
                if element.get("type") == "metric":
                    label = str(element.get("label", "Metric"))
                    value_cell = str(element.get("valueCell", "")).strip()
                    value_formula = str(element.get("valueFormula", "")).strip()
                    dash_ws[f"A{row_idx}"] = label

                    if value_formula:
                        source_ws = self._ensure_sheet(workbook, source_sheet)
                        source_ws[value_cell] = value_formula
                        if value_cell:
                            if "!" in value_cell:
                                dash_ws[f"B{row_idx}"] = f"={value_cell}"
                            else:
                                dash_ws[f"B{row_idx}"] = f"={source_sheet}!{value_cell}"
                    elif value_cell:
                        if "!" in value_cell:
                            dash_ws[f"B{row_idx}"] = f"={value_cell}"
                        else:
                            dash_ws[f"B{row_idx}"] = f"={source_sheet}!{value_cell}"

                    dashboard_kpis.append({
                        "label": label,
                        "formula": value_formula or f"={source_sheet}!{value_cell}" if value_cell else "",
                        "cell": f"B{row_idx}",
                    })
                    row_idx += 1
                elif element.get("type") == "chart":
                    chart_ref_idx = int(element.get("chartRef", -1))
                    if 0 <= chart_ref_idx < len(ai_plan.get("charts", [])):
                        chart_cfg = ai_plan["charts"][chart_ref_idx]
                        source_ws = self._ensure_sheet(workbook, str(chart_cfg.get("sheet", source_sheet)))
                        dash_chart = self._build_chart(chart_cfg, source_ws)
                        if dash_chart is not None:
                            dash_ws.add_chart(dash_chart, f"D{max(4, row_idx)}")
                            row_idx += 12
            dashboard_summary = {
                "created": True,
                "sheet": dash_name,
                "elements": len(dashboard.get("elements", [])),
                "kpis": dashboard_kpis,
            }

        return changes_log, charts_created, dashboard_summary

    @staticmethod
    def extract_sheet_preview(
        workbook: Workbook,
        sheet_name: Optional[str] = None,
        max_rows: int = 15,
    ) -> Dict[str, Any]:
        """Extract a table preview (columns + rows) from a workbook sheet."""
        if sheet_name and sheet_name in workbook.sheetnames:
            ws = workbook[sheet_name]
        elif workbook.sheetnames:
            ws = workbook[workbook.sheetnames[0]]
            sheet_name = workbook.sheetnames[0]
        else:
            return {"sheet": "", "columns": [], "rows": []}

        max_col = min(ws.max_column or 1, 20)
        max_row_actual = min(ws.max_row or 1, max_rows + 1)

        headers: List[str] = []
        for c in range(1, max_col + 1):
            val = ws.cell(row=1, column=c).value
            headers.append(str(val) if val is not None else f"Column {c}")

        rows: List[Dict[str, Any]] = []
        for r in range(2, max_row_actual + 1):
            row_data: Dict[str, Any] = {}
            non_empty = False
            for c in range(1, max_col + 1):
                val = ws.cell(row=r, column=c).value
                if isinstance(val, str) and val.startswith("="):
                    val = f"[formula]"
                row_data[headers[c - 1]] = val if val is not None else ""
                if val is not None and val != "":
                    non_empty = True
            if non_empty:
                rows.append(row_data)

        return {"sheet": sheet_name, "columns": headers, "rows": rows}

    def process_excel_request(
        self,
        workbook: Workbook,
        user_message: str,
        input_sheet_json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        sheet_json = input_sheet_json or self.workbook_to_sheet_json(workbook)
        raw = self._gemini_generate_json(user_message=user_message, sheet_json=sheet_json)
        plan = self._normalize_response(raw)

        if plan["readOnly"]:
            return {
                **plan,
                "change_tracking": [],
                "applied_charts": [],
                "dashboard_summary": {"created": False, "sheet": None, "elements": 0},
            }

        change_tracking, applied_charts, dashboard_summary = self.apply_plan_to_workbook(workbook, plan)
        return {
            **plan,
            "change_tracking": change_tracking,
            "applied_charts": applied_charts,
            "dashboard_summary": dashboard_summary,
        }
