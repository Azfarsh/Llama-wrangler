import json
import math
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.styles import PatternFill
from openpyxl.utils.cell import range_boundaries
from openpyxl.utils import get_column_letter

from app.core.config import settings

try:
    from google import genai as google_genai
except ImportError:  # pragma: no cover
    google_genai = None

try:
    from xlcalculator import Evaluator, ModelCompiler
except ImportError:  # pragma: no cover
    ModelCompiler = None
    Evaluator = None


EXCEL_AGENT_SYSTEM_PROMPT = """You are Axel AI — an expert spreadsheet assistant. You receive a DATA SUMMARY and Spreadsheet JSON.

Your job: understand the user's intent, then either (A) answer only in text, or (B) apply changes to the workbook via the JSON plan so results appear in Excel and in the app preview.

Return ONLY strict JSON in this format (no markdown, no text outside the object):
{
  "explanation": "bullet points with leading dash + space on each line",
  "changes": [],
  "charts": [],
  "dashboard": {"create": false},
  "readOnly": true
}

RULE 1 — STRICT JSON ONLY.

RULE 2 — WHEN TO MODIFY THE WORKBOOK (readOnly=false):
Set readOnly=false and populate "changes" (and optionally "charts" / "dashboard") when the user wants ANY of:
- Adding columns, rows, formulas, summaries, pivot-style tables, flags, calculated fields
- Performing operations: sort/filter results materialized on a sheet, group counts, percentages, duplicates markers, new analysis sheets
- Creating charts or dashboards they asked for
- "Do this in the spreadsheet / Excel / file", "apply to my data", "update the sheet", "run these steps"

If the user gives a multi-step numbered list that includes creating columns, summary tables, or formulas — that is a WRITE request: execute it in the workbook AND summarize in "explanation".

RULE 3 — WHEN TO STAY READ-ONLY (readOnly=true):
Set readOnly=true, empty changes/charts, dashboard.create=false ONLY when the user clearly wants information-only with NO file change, for example:
- "How many rows?", "What does column X mean?", "Explain this dataset" without asking to add or change anything
- Quick stats or insights with no request to alter the file

When unsure whether they want the file changed: if they mention adding, creating, calculating, marking, summarizing in the sheet, or "perform operations" — prefer readOnly=false and implement it.

RULE 4 — SAFETY / CELL RULES:
- Do NOT delete or clear existing data unless the user explicitly says delete/remove/clear.
- Prefer NOT to overwrite populated data cells. Add new columns starting at the first FREE column from DATA SUMMARY; add new blocks or summary tables on new sheet(s) when the change would crowd or replace core data.
- Use Excel formulas (=IF, =COUNTIF, =SUM, =AVERAGE, etc.) when the user asks for formulas or derived fields.
- Each change object: {"sheet":"Sheet1","cell":"A1","formula":"=..."} OR {"sheet":"Sheet1","cell":"A1","value":...}. Use "formula" key for formulas (include leading =).
- For visual highlighting, you may add "fillColor":"FFF59D" (hex RGB, with or without leading #) on a change object to color that cell.

RULE 5 — CHARTS:
- If they ask for a chart: add a small summary range with real values or formulas first, then add "charts" with a valid dataRange pointing at that range.
- If user asks for chart/diagram/visualization, charts[] must be non-empty.

RULE 6 — EXPLANATION:
- Always use bullet lines starting with "- " (one bullet per line, newline-separated).
- No markdown bold/asterisks. Never one giant paragraph — one idea per bullet line.
- Describe what you changed in the workbook and key insights in plain language (not raw formula dumps).
- Only mention operations that are actually present in changes/charts/dashboard.
- If user gave numbered tasks, output bullets grouped as Task 1, Task 2, ... (max 1-2 short lines each).

RULE 7 — SCOPE:
Use only sheets/columns/rows present in the provided data unless creating new sheet names you include in "changes".
"""


class ExcelAIService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY and google_genai is not None:
            self.client = google_genai.Client(api_key=settings.GEMINI_API_KEY)

    @staticmethod
    def _native_xl_value(v: Any) -> Any:
        """Convert xlcalculator / Excel types to JSON-friendly Python values."""
        if v is None:
            return ""
        if isinstance(v, bool):
            return v
        if isinstance(v, (int,)):
            return v
        if isinstance(v, float):
            if math.isnan(v) or math.isinf(v):
                return ""
            return v
        if isinstance(v, str):
            return v
        try:
            from xlcalculator.xlfunctions.func_xltypes import BLANK
            if v is BLANK:
                return ""
        except ImportError:
            pass
        try:
            from xlcalculator import xlerrors
            if isinstance(v, xlerrors.ExcelError):
                return str(v)
        except ImportError:
            pass
        inner = getattr(v, "value", v)
        if isinstance(inner, (str, int, float, bool)):
            if isinstance(inner, float) and (math.isnan(inner) or math.isinf(inner)):
                return ""
            return inner
        return str(v)

    @classmethod
    def enrich_sheet_json_and_changes_from_file(
        cls,
        file_path: str,
        sheet_json: Dict[str, Dict[str, Dict[str, Any]]],
        changes_log: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[Dict[str, Dict[str, Dict[str, Any]]], Optional[List[Dict[str, Any]]]]:
        """Evaluate formulas in a saved workbook and merge computed values into preview JSON and change log."""
        if not file_path or not os.path.isfile(file_path) or ModelCompiler is None or Evaluator is None:
            return sheet_json, changes_log
        try:
            mc = ModelCompiler()
            model = mc.read_and_parse_archive(file_path)
            ev = Evaluator(model)
            for addr in list(model.formulae.keys()):
                try:
                    ev.evaluate(addr)
                except Exception:
                    continue
            for sheet_name, cells in sheet_json.items():
                for coord, entry in cells.items():
                    full = f"{sheet_name}!{coord}"
                    if full not in model.formulae:
                        # If the preview contains formula text, never show it.
                        if entry.get("formula"):
                            entry["value"] = ""
                        continue
                    entry["value"] = cls._native_xl_value(model.get_cell_value(full))
            if changes_log:
                for ch in changes_log:
                    after = ch.get("after")
                    full = f"{ch['sheet']}!{ch['cell']}"
                    if isinstance(after, str) and after.startswith("="):
                        ch["after_display"] = cls._native_xl_value(model.get_cell_value(full))
                    else:
                        ch["after_display"] = after
            return sheet_json, changes_log
        except Exception:
            return sheet_json, changes_log

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
                    is_formula = isinstance(val, str) and val.startswith("=")
                    entry = {
                        # Never display raw formula text in the UI preview.
                        # We keep the formula in `formula` and fill `value` later
                        # after evaluating the workbook (when possible).
                        "value": "" if is_formula else (val if not isinstance(val, bytes) else str(val)),
                        "formula": val if is_formula else None,
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
            "If the user wants the workbook modified (new columns, formulas, extra sheets, summary tables, charts), "
            "you MUST set readOnly=false and include every cell write in the \"changes\" array (and charts/dashboard if requested). "
            "If you only answer facts about the data with no file change, use readOnly=true and empty changes.\n\n"
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
        changes = raw.get("changes") if isinstance(raw.get("changes"), list) else []
        charts = raw.get("charts") if isinstance(raw.get("charts"), list) else []
        dashboard = raw.get("dashboard") if isinstance(raw.get("dashboard"), dict) else {"create": False}
        read_only = bool(raw.get("readOnly", False))
        if changes or charts or bool(dashboard.get("create")):
            read_only = False
        return {
            "explanation": str(raw.get("explanation", "Processed request successfully.")),
            "changes": changes,
            "charts": charts,
            "dashboard": dashboard,
            "readOnly": read_only,
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
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any], List[str]]:
        changes_log: List[Dict[str, Any]] = []
        charts_created: List[Dict[str, Any]] = []
        dashboard_summary: Dict[str, Any] = {"created": False, "sheet": None, "elements": 0}
        dashboard_kpis: List[Dict[str, Any]] = []
        touched_sheets: set[str] = set()

        for change in ai_plan.get("changes", []):
            sheet_name = str(change.get("sheet", "Sheet1"))
            cell_ref = str(change.get("cell", "")).strip()
            if not cell_ref:
                continue
            ws = self._ensure_sheet(workbook, sheet_name)
            touched_sheets.add(sheet_name)
            before = ws[cell_ref].value
            if change.get("formula"):
                ws[cell_ref].value = str(change["formula"])
            elif "value" in change:
                ws[cell_ref].value = change.get("value")
            fill_color = str(change.get("fillColor", "")).strip().lstrip("#")
            if fill_color:
                if len(fill_color) == 6:
                    fill_color = f"FF{fill_color.upper()}"
                elif len(fill_color) == 8:
                    fill_color = fill_color.upper()
                if len(fill_color) == 8:
                    ws[cell_ref].fill = PatternFill(fill_type="solid", start_color=fill_color, end_color=fill_color)
            after = ws[cell_ref].value
            changes_log.append({
                "sheet": sheet_name,
                "cell": cell_ref,
                "before": before,
                "after": after,
                "fillColor": str(change.get("fillColor", "")).strip() or None,
            })

        for idx, chart_cfg in enumerate(ai_plan.get("charts", [])):
            sheet_name = str(chart_cfg.get("sheet", "Sheet1"))
            ws = self._ensure_sheet(workbook, sheet_name)
            touched_sheets.add(sheet_name)
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
            touched_sheets.add(dash_name)
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

        return changes_log, charts_created, dashboard_summary, sorted(touched_sheets)

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
                    # Never display raw formula text in any previews.
                    val = ""
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

        change_tracking, applied_charts, dashboard_summary, changed_sheets = self.apply_plan_to_workbook(workbook, plan)
        return {
            **plan,
            "change_tracking": change_tracking,
            "applied_charts": applied_charts,
            "dashboard_summary": dashboard_summary,
            "changed_sheets": changed_sheets,
        }
