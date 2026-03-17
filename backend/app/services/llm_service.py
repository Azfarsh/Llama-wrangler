"""
LLM Service: Gemini-first implementation.
"""
import json
import re
import asyncio
import difflib
from typing import Optional, List, Dict, Any

from app.core.config import settings

# Optional Google GenAI SDK
_google_genai_available = False
try:
    from google import genai as google_genai
    _google_genai_available = True
except ImportError:
    pass

def _extract_json(text: str):
    """Extract first JSON object or array from text."""
    try:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if match:
            return json.loads(match.group(1).strip())
        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if match:
            return json.loads(match.group(1))
        if text.strip().startswith("{") or text.strip().startswith("["):
            return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    return None


class LLMService:
    def __init__(self):
        self._gemini_client = None
        if settings.GEMINI_API_KEY and _google_genai_available:
            try:
                self._gemini_client = google_genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                self._gemini_client = None

    @staticmethod
    def _normalize_query(user_query: str) -> str:
        return re.sub(r"\s+", " ", (user_query or "").strip().lower())

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r"[a-z0-9]+", (text or "").lower())

    @staticmethod
    def _has_semantic_token(
        normalized_query: str,
        targets: List[str],
        fuzzy_cutoff: float = 0.8
    ) -> bool:
        tokens = LLMService._tokenize(normalized_query)
        if not tokens:
            return False
        token_set = set(tokens)
        for target in targets:
            t = (target or "").lower()
            if not t:
                continue
            if t in token_set:
                return True
            # Prefix matching for forms like "uniques", "uniqueness", "rowss"
            if any(tok.startswith(t) or t.startswith(tok) for tok in tokens if len(tok) >= 3 and len(t) >= 3):
                return True
            if difflib.get_close_matches(t, tokens, n=1, cutoff=fuzzy_cutoff):
                return True
        return False

    @staticmethod
    def _is_unique_rows_request(normalized_query: str) -> bool:
        unique_like = LLMService._has_semantic_token(normalized_query, ["unique", "distinct", "uniq"], fuzzy_cutoff=0.74)
        row_like = LLMService._is_row_sample_request(normalized_query)
        return unique_like and row_like

    @staticmethod
    def _extract_row_count(user_query: str, default: int = 5) -> int:
        match = re.search(r"\b(\d{1,4})\b", user_query or "")
        if not match:
            return default
        try:
            return max(1, int(match.group(1)))
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _find_column_mentions(user_query: str, columns: List[str]) -> List[str]:
        if not user_query or not columns:
            return []
        q = user_query.lower()
        matched: List[str] = []

        # Exact phrase match first (preserves user intent for multi-word columns).
        for col in columns:
            col_str = str(col).strip()
            if not col_str:
                continue
            if re.search(rf"(?<!\w){re.escape(col_str.lower())}(?!\w)", q):
                matched.append(col_str)

        if matched:
            # Deduplicate while preserving order
            return list(dict.fromkeys(matched))

        # Fallback token-based match for patterns like "area column"
        q_tokens = set(re.findall(r"[a-z0-9]+", q))
        for col in columns:
            col_str = str(col).strip()
            col_tokens = re.findall(r"[a-z0-9]+", col_str.lower())
            if col_tokens and any(tok in q_tokens for tok in col_tokens):
                matched.append(col_str)

        return list(dict.fromkeys(matched))

    @staticmethod
    def _is_row_sample_request(normalized_query: str) -> bool:
        q = normalized_query or ""
        if not q:
            return False

        # "for every row/each row" usually describes a transformation scope, not preview sampling.
        if re.search(r"\b(for\s+)?(every|each)\s+row(s)?\b", q) and not re.search(
            r"\b(show|display|list|preview|get|give|provide)\b.{0,40}\b\d+\s+(rows?|records?)\b", q
        ):
            return False

        strong_preview_tokens = ["sample", "preview", "head", "tail", "top", "first", "last", "random"]
        if LLMService._has_semantic_token(q, strong_preview_tokens, fuzzy_cutoff=0.76):
            return True

        if re.search(r"\b(show|give|provide|display|list|get)\b.{0,40}\b(rows?|records?)\b", q):
            return True

        if re.search(r"\b\d+\s+(rows?|records?)\b", q):
            return True

        return False

    @staticmethod
    def _extract_new_column_name(user_query: str) -> Optional[str]:
        q = (user_query or "").strip()
        if not q:
            return None

        patterns = [
            r"(?:add|create|insert)\s+(?:a\s+)?(?:new\s+)?column\s+(?:named|called)\s+['\"]?([^'\"\n,.=]+?)['\"]?(?=\s*(?:=|with|for|to|and|,|$))",
            r"(?:add|create|insert)\s+(?:a\s+)?(?:new\s+)?column\s+['\"]?([^'\"\n,.=]+?)['\"]?(?=\s*(?:=|with|for|to|and|,|$))",
        ]
        for pattern in patterns:
            match = re.search(pattern, q, flags=re.IGNORECASE)
            if match:
                col = (match.group(1) or "").strip()
                if col:
                    return col
        return None

    @staticmethod
    def _extract_constant_value(user_query: str) -> Optional[Any]:
        q = (user_query or "").strip()
        if not q:
            return None

        quoted_match = re.search(r"(?:value|as|with)\s+(?:the\s+)?['\"]([^'\"]+)['\"]", q, flags=re.IGNORECASE)
        if quoted_match:
            return quoted_match.group(1).strip()

        equals_quoted_match = re.search(r"=\s*['\"]([^'\"]+)['\"]", q)
        if equals_quoted_match:
            return equals_quoted_match.group(1).strip()

        bare_value_match = re.search(r"(?:value|as)\s+(?:of\s+)?(?:the\s+)?([A-Za-z0-9_.-]+)", q, flags=re.IGNORECASE)
        if bare_value_match:
            token = bare_value_match.group(1).strip()
            if token:
                lowered = token.lower()
                if lowered in {"every", "each", "all", "row", "rows", "column", "dataset"}:
                    return None
                return token
        return None

    @staticmethod
    def _extract_formula_expression(user_query: str, columns: List[str]) -> Optional[str]:
        q = (user_query or "").strip()
        if not q:
            return None

        expression_match = re.search(
            r"(?:formula|expression)\s*(?:is|:|=)?\s*([A-Za-z0-9_ \t.+\-*/()]+)",
            q,
            flags=re.IGNORECASE,
        )
        if expression_match:
            expr = expression_match.group(1).strip()
            if any(op in expr for op in ["*", "+", "-", "/"]):
                return expr

        equals_match = re.search(r"=\s*([A-Za-z0-9_ \t.+\-*/()]+)", q)
        if equals_match:
            expr = equals_match.group(1).strip()
            if any(op in expr for op in ["*", "+", "-", "/"]):
                if columns:
                    col_tokens = {str(c).lower() for c in columns}
                    tokens = {t.lower() for t in re.findall(r"[A-Za-z_][A-Za-z0-9_ ]*", expr)}
                    if any(tok.strip() in col_tokens for tok in tokens):
                        return expr
                return expr
        return None

    def _build_rule_based_plan(self, user_query: str, dataset_metadata: dict) -> List[Dict[str, Any]]:
        """
        Lightweight deterministic planner for common instructions.
        This handles precise requests reliably and avoids over-transforming data.
        """
        q = self._normalize_query(user_query)
        columns = dataset_metadata.get("columns", []) or []
        if not q:
            return []

        plan: List[Dict[str, Any]] = []
        mentioned_cols = self._find_column_mentions(q, columns)

        asks_unique_rows = self._is_unique_rows_request(q)
        asks_rows = self._is_row_sample_request(q)
        asks_sort = "sort" in q
        asks_add_column = any(k in q for k in ["add column", "new column", "create column", "insert column"])
        asks_dedup = any(k in q for k in ["remove duplicate", "deduplicate", "drop duplicate", "no duplicate"]) or (
            self._has_semantic_token(q, ["duplicate", "duplicates", "dup"], fuzzy_cutoff=0.8) and
            self._has_semantic_token(q, ["remove", "drop", "delete"], fuzzy_cutoff=0.8)
        )
        asks_insights_only = (
            (
                any(k in q for k in ["insight", "summary", "overview", "statistics", "stats", "analyze"])
                or self._has_semantic_token(q, ["insight", "summary", "overview", "explain", "describe", "about"], fuzzy_cutoff=0.78)
            )
            and not asks_unique_rows
            and not asks_rows
            and not asks_sort
            and not asks_dedup
            and not any(
                k in q
                for k in [
                    "drop", "remove", "fill", "convert", "encode", "normalize",
                    "slice", "reorder", "move", "add column", "group by", "summary per",
                ]
            )
        )

        if asks_unique_rows:
            count = self._extract_row_count(q, default=5)
            params: Dict[str, Any] = {"count": count, "keep": "first"}
            if mentioned_cols:
                params["columns"] = mentioned_cols[:5]
            plan.append({"type": "keep_unique_rows", "params": params})

        if asks_add_column:
            new_col = self._extract_new_column_name(user_query)
            formula = self._extract_formula_expression(user_query, columns)
            const_value = self._extract_constant_value(user_query)
            params: Dict[str, Any] = {}
            if new_col:
                params["new_column"] = new_col
            if formula:
                params["formula"] = formula
            elif const_value is not None:
                params["value"] = const_value
            if params.get("new_column") and ("formula" in params or "value" in params):
                plan.append({"type": "add_column", "params": params})

        if asks_sort:
            sort_cols = mentioned_cols[:3]
            if sort_cols:
                ascending = any(k in q for k in ["ascending", "asc", "low to high", "a-z"])
                descending = any(k in q for k in ["descending", "desc", "high to low", "z-a"])
                if descending:
                    ascending = False
                plan.append({"type": "sort", "params": {"columns": sort_cols, "ascending": ascending}})

        if asks_dedup and not any(op["type"] == "remove_duplicates" for op in plan):
            plan.append({"type": "remove_duplicates", "params": {}})

        if asks_rows and not asks_unique_rows:
            rows = self._extract_row_count(q, default=5)
            method = "head"
            if any(k in q for k in ["tail", "last"]):
                method = "tail"
            elif any(k in q for k in ["random", "sample"]):
                method = "random"
            plan.append({"type": "slice", "params": {"rows": rows, "method": method}})

        if asks_insights_only:
            return []

        return plan

    @staticmethod
    def _is_explicitly_requested(op_type: str, normalized_query: str) -> bool:
        patterns = {
            "drop_columns": ["drop column", "remove column", "delete column"],
            "drop_constant_columns": ["constant column", "single value column"],
            "drop_na": ["drop null", "drop missing", "remove null", "remove missing"],
            "fill_na": ["fill null", "fill missing", "impute"],
            "rename_columns": ["rename column"],
            "convert_type": ["convert", "change type", "cast"],
            "remove_duplicates": ["remove duplicate", "deduplicate", "drop duplicate"],
            "encode_categorical": ["encode", "label encode", "one hot"],
            "extract_datetime_features": ["extract date", "extract datetime", "date features"],
            "vectorize_text": ["vectorize", "tfidf", "text features"],
            "normalize_numeric": ["normalize", "standardize", "scale"],
            "slice": ["head", "tail", "first", "last", "top", "sample", "random", "rows"],
            "keep_unique_rows": ["unique rows", "distinct rows", "unique values"],
            "sort": ["sort"],
            "add_column": ["add column", "new column"],
            "reorder_columns": ["reorder", "arrange columns"],
            "move_column": ["move column"],
            "create_summary": ["group by", "summary per", "aggregate"],
            "clean_missing": ["clean missing"],
            "filter_rows": ["filter", "where", "only rows", "condition"],
            "pivot_table": ["pivot", "pivot table", "cross tab"],
            "unpivot": ["unpivot", "melt", "long format"],
            "split_column": ["split column", "split by"],
            "merge_columns": ["merge columns", "concat columns", "combine columns"],
            "trim_text": ["trim", "strip spaces", "remove extra spaces"],
            "replace_values": ["replace values", "map values", "recode"],
            "format_datetime": ["format date", "format datetime"],
            "add_rank": ["rank", "ranking"],
            "running_total": ["running total", "cumulative sum"],
            "percentage_of_total": ["percent of total", "percentage of total", "share of total"],
            "clip_outliers": ["clip outliers", "cap outliers", "winsorize"],
        }
        return any(token in normalized_query for token in patterns.get(op_type, []))

    def _apply_query_guardrails(self, user_query: str, plan: List[Dict[str, Any]], dataset_metadata: dict) -> List[Dict[str, Any]]:
        """
        Prevent accidental destructive transformations for preview/unique/insight requests.
        """
        q = self._normalize_query(user_query)
        if not plan:
            return []

        asks_unique_rows = self._is_unique_rows_request(q)
        asks_rows = self._is_row_sample_request(q)
        asks_insights = any(k in q for k in ["insight", "summary", "overview", "statistics", "stats", "analyze"]) or self._has_semantic_token(
            q, ["insight", "summary", "overview", "explain", "describe", "about"], fuzzy_cutoff=0.78
        )

        explicit_transform = any(
            token in q
            for token in [
                "drop", "remove", "fill", "convert", "encode", "normalize", "vectorize",
                "rename", "reorder", "move column", "group by", "add column", "clean missing",
                "filter", "pivot", "split", "merge", "trim", "replace", "rank", "running total",
            ]
        )

        if asks_insights and not asks_rows and not explicit_transform:
            return []

        if asks_unique_rows or asks_rows:
            safe_ops = {"keep_unique_rows", "slice", "sort", "remove_duplicates"}
            filtered: List[Dict[str, Any]] = []
            for op in plan:
                op_type = (op or {}).get("type")
                if op_type in safe_ops or self._is_explicitly_requested(op_type, q):
                    filtered.append(op)

            if asks_unique_rows and not any((op or {}).get("type") == "keep_unique_rows" for op in filtered):
                fallback_unique = self._build_rule_based_plan(user_query, dataset_metadata)
                if fallback_unique:
                    return fallback_unique

            if filtered:
                return filtered

            fallback = self._build_rule_based_plan(user_query, dataset_metadata)
            return fallback

        return plan

    @staticmethod
    def _safe_int(value: Any, default: int = 0) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _is_generic_summary(text: str) -> bool:
        t = (text or "").strip().lower()
        if not t:
            return True
        generic_patterns = [
            "processed successfully",
            "data quality",
            "no data quality issues",
            "dataset cleaned",
            "transformation complete",
            "rows and columns",
        ]
        return any(p in t for p in generic_patterns)

    def _infer_dataset_topic(self, metadata: dict) -> str:
        columns = [str(c).lower() for c in (metadata.get("columns") or [])]
        if not columns:
            return "a tabular dataset with structured records"

        def has_any(words: List[str]) -> bool:
            return any(any(w in col for w in words) for col in columns)

        if has_any(["shop", "store", "vendor", "business"]) and has_any(["address", "area", "locality", "city", "location"]):
            return "a business listing dataset of shops with location/contact details"
        if has_any(["student", "roll", "grade", "marks", "subject", "college"]):
            return "an education dataset containing student/academic records"
        if has_any(["sales", "revenue", "amount", "price", "quantity", "order"]):
            return "a sales/transaction dataset"
        if has_any(["patient", "hospital", "diagnosis", "doctor", "symptom"]):
            return "a healthcare dataset with patient/medical attributes"
        if has_any(["employee", "salary", "department", "designation", "joining"]):
            return "an HR dataset containing employee details"
        if has_any(["date", "time"]) and has_any(["value", "metric", "count"]):
            return "a time-based metrics dataset"

        top_cols = ", ".join((metadata.get("columns") or [])[:3])
        return f"a structured dataset organized around fields like {top_cols}"

    def _build_deterministic_insights(
        self,
        original_metadata: dict,
        processed_metadata: dict,
        execution_log: list
    ) -> dict:
        orig_rows = self._safe_int(original_metadata.get("total_rows"))
        proc_rows = self._safe_int(processed_metadata.get("total_rows"))
        orig_cols = self._safe_int(original_metadata.get("total_columns"))
        proc_cols = self._safe_int(processed_metadata.get("total_columns"))

        orig_missing = self._safe_int(sum((original_metadata.get("missing_values") or {}).values()))
        proc_missing = self._safe_int(sum((processed_metadata.get("missing_values") or {}).values()))
        orig_dup = self._safe_int(original_metadata.get("duplicate_rows"))
        proc_dup = self._safe_int(processed_metadata.get("duplicate_rows"))

        row_delta = proc_rows - orig_rows
        col_delta = proc_cols - orig_cols

        insights: List[str] = []
        if row_delta == 0:
            insights.append(f"Row count stayed the same at {proc_rows}.")
        elif row_delta < 0:
            insights.append(f"Rows reduced from {orig_rows} to {proc_rows} (removed {abs(row_delta)} rows).")
        else:
            insights.append(f"Rows increased from {orig_rows} to {proc_rows} (added {row_delta} rows).")

        if col_delta == 0:
            insights.append(f"Column count stayed the same at {proc_cols}.")
        elif col_delta < 0:
            insights.append(f"Columns reduced from {orig_cols} to {proc_cols} (removed {abs(col_delta)} columns).")
        else:
            insights.append(f"Columns increased from {orig_cols} to {proc_cols} (added {col_delta} columns).")

        if orig_missing == proc_missing:
            insights.append(f"Missing values unchanged at {proc_missing}.")
        elif proc_missing < orig_missing:
            insights.append(f"Missing values improved from {orig_missing} to {proc_missing}.")
        else:
            insights.append(f"Missing values changed from {orig_missing} to {proc_missing}.")

        if proc_dup < orig_dup:
            insights.append(f"Duplicate rows reduced from {orig_dup} to {proc_dup}.")
        else:
            insights.append(f"Duplicate rows currently at {proc_dup}.")

        categorical = (processed_metadata.get("summary") or {}).get("categorical") or {}
        if categorical:
            first_col = next(iter(categorical.keys()))
            top_values = categorical.get(first_col) or {}
            if top_values:
                top_key = next(iter(top_values.keys()))
                top_count = top_values.get(top_key)
                insights.append(f"Most frequent value in '{first_col}' is '{top_key}' ({top_count} rows).")

        topic = self._infer_dataset_topic(processed_metadata)
        summary = (
            f"This dataset appears to be {topic}. "
            f"It currently contains {proc_rows} records across {proc_cols} columns."
        )
        insights.insert(0, f"Dataset meaning: it looks like {topic}.")

        # Simple quality score
        quality_score = 0
        if proc_rows > 0:
            quality_score += 1
        if proc_missing == 0:
            quality_score += 1
        elif proc_missing < orig_missing:
            quality_score += 0.5
        if proc_dup == 0:
            quality_score += 1
        elif proc_dup < orig_dup:
            quality_score += 0.5

        if proc_rows == 0:
            data_quality = "poor"
        elif quality_score >= 2.5:
            data_quality = "good"
        elif quality_score >= 1.5:
            data_quality = "fair"
        else:
            data_quality = "poor"

        numeric_cols = processed_metadata.get("numeric_columns", []) or []
        text_cols = processed_metadata.get("text_columns", []) or []
        use_cases = ["Analytics", "Reporting"]
        if len(numeric_cols) >= 2 and proc_rows >= 20:
            use_cases.insert(0, "Machine Learning")
        elif len(text_cols) > 0:
            use_cases.append("Dashboarding")

        # Include first few execution steps so response reflects actual operations.
        for step in (execution_log or [])[:3]:
            insights.append(f"Applied step: {step}")

        return {
            "summary": summary,
            "insights": insights[:8],
            "data_quality": data_quality,
            "use_cases": list(dict.fromkeys(use_cases)),
        }

    def _gemini_generate_sync(self, instruction: str, system: Optional[str] = None) -> str:
        if not self._gemini_client:
            raise RuntimeError("Gemini client is not configured.")
        prompt = instruction if not system else f"{system}\n\n{instruction}"
        response = self._gemini_client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if not text:
            raise RuntimeError("Gemini returned an empty response.")
        return text.strip()

    async def generate(self, instruction: str, system: Optional[str] = None, max_tokens: int = 512) -> str:
        """Generate text using Gemini 2.5 Flash."""
        if self._gemini_client:
            loop = asyncio.get_event_loop()
            try:
                return await loop.run_in_executor(None, self._gemini_generate_sync, instruction, system)
            except Exception as e:
                print(f"Gemini generation error: {e}")
        raise RuntimeError("Gemini is not configured or unavailable. Set GEMINI_API_KEY and retry.")

    async def analyze_intent(self, user_query: str, dataset_metadata: dict, rag_context: Optional[str] = None) -> dict:
        """Agent 1: Intent Understanding (with optional RAG context)."""
        ctx = f"\n\n{rag_context}" if rag_context else ""
        instruction = f"""Analyze the user query and dataset metadata.

User Query: {user_query}

Dataset: {dataset_metadata.get('total_columns')} columns, {dataset_metadata.get('total_rows')} rows.
Columns: {dataset_metadata.get('columns', [])[:20]}{ctx}

Return ONLY valid JSON in this format (no markdown, no explanation):
{{"goal": "short goal", "purpose": "analytics|ml|reporting|general", "requires_cleaning": true, "requires_transformation": true, "key_requirements": ["req1", "req2"]}}"""

        try:
            text = await self.generate(instruction, max_tokens=256)
            result = _extract_json(text)
            if result and isinstance(result, dict):
                if "key_requirements" not in result:
                    result["key_requirements"] = ["Process dataset"]
                return result
        except Exception as e:
            print(f"Intent analysis error: {e}")
        return {
            "goal": "Process dataset",
            "purpose": "general",
            "requires_cleaning": True,
            "requires_transformation": True,
            "key_requirements": ["Clean and prepare data"],
        }

    async def generate_plan(self, user_query: str, dataset_metadata: dict, intent: Optional[dict] = None, rag_context: Optional[str] = None) -> list:
        """Agent 2: Planning Agent - pure LLM plan without hardcoded query cases."""
        intent = intent or {}
        q = self._normalize_query(user_query)
        ctx = f"\nRelevant context:\n{rag_context}" if rag_context else ""
        instruction = f"""Generate a JSON array of data wrangling operations for this request.

User Query: "{user_query}"
Intent: {json.dumps(intent)}
Columns: {dataset_metadata.get('columns', [])}{ctx}

Supported operations (return only type and params):
- drop_columns: {{"columns": ["col1"]}}
- drop_constant_columns: {{}}
- drop_na: {{}} or {{"columns": ["col"]}}
- fill_na: {{"columns": [], "value": 0}} or {{"method": "mean"}}
- rename_columns: {{"mapping": {{"old": "new"}}}}
- convert_type: {{"columns": ["col"], "target_type": "float|int|datetime|str"}}
- remove_duplicates: {{}}
- encode_categorical: {{"columns": ["col"]}}
- extract_datetime_features: {{"columns": ["date_col"]}}
- vectorize_text: {{"columns": ["text_col"], "max_features": 50}}
- normalize_numeric: {{"columns": ["num_col"]}}
- slice: {{"rows": 100, "method": "head|tail|random"}}
- sort: {{"columns": ["Date"], "ascending": false}}
- add_column: {{"new_column": "Total", "formula": "Price * Quantity"}}
- reorder_columns: {{"column_order": ["Name", "Date", "Amount"]}}
- move_column: {{"column": "Sales", "after_column": "Region"}}
- create_summary: {{"group_by": ["Region"]}}
- clean_missing: {{"how": "any"}}
- filter_rows: {{"column": "Status", "operator": "==|!=|>|>=|<|<=|contains|startswith|endswith", "value": "Active"}}
- pivot_table: {{"group_by": ["Region"], "values": ["Sales"], "aggfunc": "sum|mean|count|min|max"}}
- unpivot: {{"id_vars": ["ID"], "value_vars": ["Jan", "Feb"], "var_name": "Month", "value_name": "Amount"}}
- split_column: {{"column": "FullName", "delimiter": " ", "into": ["FirstName", "LastName"]}}
- merge_columns: {{"columns": ["City", "State"], "new_column": "Location", "separator": ", "}}
- trim_text: {{"columns": ["Name", "Email"]}}
- replace_values: {{"column": "Status", "mapping": {{"Y": "Yes", "N": "No"}}}}
- format_datetime: {{"columns": ["OrderDate"], "format": "%Y-%m-%d"}}
- add_rank: {{"sort_by": "Revenue", "new_column": "RevenueRank", "ascending": false}}
- running_total: {{"source_column": "Sales", "new_column": "RunningSales", "group_by": ["Region"]}}
- percentage_of_total: {{"source_column": "Sales", "new_column": "SalesPct", "group_by": ["Region"]}}
- clip_outliers: {{"columns": ["Amount"], "lower_quantile": 0.01, "upper_quantile": 0.99}}

Example: [{{"type": "sort", "params": {{"columns": ["Date"], "ascending": false}}}}]

Return ONLY the JSON array, no other text."""

        try:
            text = await self.generate(instruction, max_tokens=512)
            plan = _extract_json(text)
            if isinstance(plan, list) and len(plan) > 0:
                guarded = self._apply_query_guardrails(user_query, plan, dataset_metadata)
                if guarded or (guarded == [] and any(k in q for k in ["insight", "summary", "overview", "stats", "analyze"])):
                    return guarded
        except Exception as e:
            print(f"Plan generation error: {e}")
        return []

    async def generate_dataframe_code(
        self,
        user_query: str,
        dataset_metadata: dict,
        rag_context: Optional[str] = None,
        previous_error: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """
        Generate executable pandas code for arbitrary query-driven transformations.
        The code must transform variable `df` and keep it a DataFrame.
        """
        columns = dataset_metadata.get("columns", [])
        dtypes = dataset_metadata.get("dtypes", {})
        preview = (dataset_metadata.get("head") or [])[:3]
        ctx = f"\nRelevant context:\n{rag_context}" if rag_context else ""
        err_ctx = f"\nPrevious execution error to fix:\n{previous_error}\n" if previous_error else ""
        history = conversation_history or []
        recent_history = history[-6:]
        history_ctx = ""
        if recent_history:
            lines = []
            for idx, item in enumerate(recent_history, start=1):
                role = str(item.get("role", "system"))
                text = str(item.get("text", "")).strip()
                if text:
                    lines.append(f"{idx}. {role}: {text}")
            if lines:
                history_ctx = "\nRecent conversation context:\n" + "\n".join(lines)

        instruction = f"""You are a professional Excel data agent and dataframe transformation engine.
Given a user query and dataset schema, produce Python code that transforms pandas DataFrame variable `df`.

User Query: "{user_query}"
Columns: {columns}
Dtypes: {json.dumps(dtypes)}
Preview rows: {json.dumps(preview)}{ctx}{history_ctx}{err_ctx}

STRICT RULES:
- Output ONLY Python code (no markdown, no explanation).
- Do NOT import anything.
- Use only existing variables: df, pd, np.
- The final variable MUST be named `df` and remain a pandas DataFrame.
- Prefer robust code: handle missing columns safely and avoid crashing.
- If user asks for additional result tables/summaries, place them in dict variable `excel_outputs`.
- `excel_outputs` format: {{"SummaryByArea": summary_df, "TopRows": top_df}}.
- If query asks for analysis-only, keep df unchanged.

Return code only."""
        text = await self.generate(instruction, max_tokens=700)
        code = (text or "").strip()
        code = re.sub(r"^```(?:python)?\s*", "", code)
        code = re.sub(r"\s*```$", "", code).strip()
        return code

    async def recommend_target_column(self, columns: list, sample_values: Optional[dict] = None) -> dict:
        """Prediction engineering: recommend target column and task (classification/regression)."""
        cols_str = ", ".join(columns[:50])
        instruction = f"""Given these dataset column names, which single column is most likely the TARGET for a machine learning task (the variable to predict)?
Columns: {cols_str}

Return ONLY valid JSON: {{"target_column": "exact_column_name", "reason": "one short sentence"}}
If unsure, pick the last column. Return only the JSON, no markdown."""

        try:
            text = await self.generate(instruction, max_tokens=150)
            result = _extract_json(text)
            if result and isinstance(result, dict) and result.get("target_column"):
                target = result["target_column"]
                if target not in columns:
                    for c in columns:
                        if c.lower() == target.lower():
                            target = c
                            break
                    else:
                        target = columns[-1] if columns else ""
                result["target_column"] = target
                # Rule-based: classification vs regression (by unique count - we'll set in FTI/data_service)
                result["task"] = "classification"  # default; can override with unique ratio
                return result
        except Exception as e:
            print(f"Target recommendation error: {e}")
        return {"target_column": columns[-1] if columns else "", "reason": "Default: last column", "task": "classification"}

    async def generate_insights(self, original_metadata: dict, processed_metadata: dict, execution_log: list, intent: dict) -> dict:
        """Agent 3: Insight generation."""
        baseline = self._build_deterministic_insights(original_metadata, processed_metadata, execution_log)
        instruction = f"""Summarize this data wrangling result in JSON.

Original: {original_metadata.get('total_rows')} rows, {original_metadata.get('total_columns')} columns.
Processed: {processed_metadata.get('total_rows')} rows, {processed_metadata.get('total_columns')} columns.
Steps: {execution_log[:15]}
Columns: {processed_metadata.get('columns', [])[:15]}
Sample row: {(processed_metadata.get('head') or [{}])[0]}

Return ONLY valid JSON:
{{"summary": "Explain in plain language what this dataset is about", "insights": ["insight1", "insight2"], "data_quality": "good|fair|poor", "use_cases": ["ML", "Analytics", "Reporting"]}}"""

        try:
            text = await self.generate(instruction, max_tokens=256)
            result = _extract_json(text)
            if result and isinstance(result, dict):
                merged = dict(baseline)
                summary = str(result.get("summary", "")).strip()
                if summary and len(summary) > 15 and summary.lower() != "dataset processed successfully." and not self._is_generic_summary(summary):
                    merged["summary"] = summary
                llm_insights = result.get("insights")
                if isinstance(llm_insights, list):
                    merged["insights"] = list(dict.fromkeys((baseline.get("insights", []) + llm_insights)))[:8]
                llm_quality = str(result.get("data_quality", "")).lower().strip()
                if llm_quality in {"good", "fair", "poor", "excellent"}:
                    merged["data_quality"] = llm_quality
                llm_use_cases = result.get("use_cases")
                if isinstance(llm_use_cases, list):
                    merged["use_cases"] = list(dict.fromkeys((baseline.get("use_cases", []) + llm_use_cases)))[:5]
                return merged
        except Exception as e:
            print(f"Insight generation error: {e}")
        return baseline
