"""
Pydantic schemas for action plan validation.
Ensures no arbitrary code execution - only whitelisted operations.
"""
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field


# Whitelist of allowed operation types
ALLOWED_OPERATIONS = {
    "drop_columns", "drop_constant_columns", "drop_na", "fill_na",
    "rename_columns", "convert_type", "remove_duplicates", "encode_categorical",
    "extract_datetime_features", "vectorize_text", "normalize_numeric", "slice",
    "keep_unique_rows", "sort", "add_column", "reorder_columns", "move_column", "create_summary",
    "translate", "clean_missing",
    "filter_rows", "pivot_table", "unpivot", "split_column", "merge_columns",
    "trim_text", "replace_values", "format_datetime", "add_rank",
    "running_total", "percentage_of_total", "clip_outliers",
}


class OperationParams(BaseModel):
    """Flexible params - validated per operation type."""
    columns: Optional[List[str]] = None
    column: Optional[str] = None
    mapping: Optional[Dict[str, str]] = None
    target_type: Optional[str] = None
    value: Optional[Any] = None
    method: Optional[str] = None
    how: Optional[str] = None
    subset: Optional[List[str]] = None
    max_features: Optional[int] = None
    rows: Optional[int] = None
    ascending: Optional[bool] = None
    formula: Optional[str] = None  # e.g. "Price * Quantity"
    new_column: Optional[str] = None
    column_order: Optional[List[str]] = None
    after_column: Optional[str] = None
    group_by: Optional[List[str]] = None
    target_language: Optional[str] = None
    count: Optional[int] = None
    operator: Optional[str] = None
    id_vars: Optional[List[str]] = None
    value_vars: Optional[List[str]] = None
    var_name: Optional[str] = None
    value_name: Optional[str] = None
    delimiter: Optional[str] = None
    into: Optional[List[str]] = None
    separator: Optional[str] = None
    format: Optional[str] = None
    sort_by: Optional[str] = None
    source_column: Optional[str] = None
    aggfunc: Optional[str] = None
    lower_quantile: Optional[float] = None
    upper_quantile: Optional[float] = None

    class Config:
        extra = "ignore"  # Ignore unknown params


class ActionStep(BaseModel):
    """Single actionable step in the plan."""
    type: str = Field(..., description="Operation type")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict)

    def validate_operation(self) -> bool:
        """Ensure operation is in whitelist."""
        return self.type in ALLOWED_OPERATIONS


def _only_existing_columns(values: Optional[List[str]], available_columns: Optional[List[str]]) -> List[str]:
    if not values:
        return []
    if not available_columns:
        return [str(v) for v in values if isinstance(v, str)]
    allowed = set(available_columns)
    return [v for v in values if isinstance(v, str) and v in allowed]


def _sanitize_op(op_type: str, params: Dict[str, Any], available_columns: Optional[List[str]]) -> Optional[Dict[str, Any]]:
    safe: Dict[str, Any] = {}

    if op_type in {"drop_constant_columns", "remove_duplicates"}:
        return safe

    if op_type in {"drop_columns", "drop_na", "encode_categorical", "extract_datetime_features", "normalize_numeric"}:
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if op_type == "drop_na":
            safe["columns"] = cols
            how = params.get("how")
            if how in {"any", "all"}:
                safe["how"] = how
            return safe
        if not cols:
            return None
        safe["columns"] = cols
        return safe

    if op_type == "fill_na":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if cols:
            safe["columns"] = cols
        if "value" in params:
            safe["value"] = params.get("value")
            return safe
        method = params.get("method")
        if method in {"mean", "median", "mode"}:
            safe["method"] = method
            return safe
        return None

    if op_type == "rename_columns":
        mapping = params.get("mapping")
        if not isinstance(mapping, dict):
            return None
        out: Dict[str, str] = {}
        for k, v in mapping.items():
            if isinstance(k, str) and isinstance(v, str):
                if (not available_columns) or (k in available_columns):
                    out[k] = v
        if not out:
            return None
        safe["mapping"] = out
        return safe

    if op_type == "convert_type":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        target_type = params.get("target_type")
        if not cols or target_type not in {"float", "int", "datetime", "str"}:
            return None
        safe["columns"] = cols
        safe["target_type"] = target_type
        return safe

    if op_type == "vectorize_text":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if not cols:
            return None
        safe["columns"] = cols
        max_features = params.get("max_features", 50)
        try:
            max_features = int(max_features)
        except (TypeError, ValueError):
            max_features = 50
        safe["max_features"] = max(1, min(max_features, 1000))
        return safe

    if op_type == "slice":
        rows = params.get("rows", 5)
        method = params.get("method", "head")
        try:
            rows = int(rows)
        except (TypeError, ValueError):
            rows = 5
        if method not in {"head", "tail", "random"}:
            method = "head"
        safe["rows"] = max(1, rows)
        safe["method"] = method
        return safe

    if op_type == "keep_unique_rows":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        count = params.get("count", params.get("rows", 5))
        keep = params.get("keep", "first")
        try:
            count = int(count)
        except (TypeError, ValueError):
            count = 5
        if keep not in {"first", "last"}:
            keep = "first"
        if cols:
            safe["columns"] = cols
        safe["count"] = max(1, count)
        safe["keep"] = keep
        return safe

    if op_type == "sort":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if not cols:
            return None
        safe["columns"] = cols
        safe["ascending"] = bool(params.get("ascending", False))
        return safe

    if op_type == "add_column":
        new_column = params.get("new_column") or params.get("column")
        formula = params.get("formula") or params.get("expression")
        if not isinstance(new_column, str):
            return None
        safe["new_column"] = new_column
        if isinstance(formula, str) and formula.strip():
            safe["formula"] = formula.strip()
            return safe
        if "value" in params:
            safe["value"] = params.get("value")
            return safe
        return None

    if op_type == "reorder_columns":
        cols = _only_existing_columns(params.get("column_order", params.get("columns")), available_columns)
        if not cols:
            return None
        safe["column_order"] = cols
        return safe

    if op_type == "move_column":
        column = params.get("column")
        after = params.get("after_column")
        if not isinstance(column, str) or not isinstance(after, str):
            return None
        if available_columns and (column not in available_columns or after not in available_columns):
            return None
        safe["column"] = column
        safe["after_column"] = after
        return safe

    if op_type == "create_summary":
        group_by = _only_existing_columns(params.get("group_by", params.get("columns")), available_columns)
        if not group_by:
            return None
        safe["group_by"] = group_by
        return safe

    if op_type == "clean_missing":
        how = params.get("how", "any")
        safe["how"] = "all" if how == "all" else "any"
        return safe

    if op_type == "translate":
        target_language = params.get("target_language")
        if isinstance(target_language, str) and target_language.strip():
            safe["target_language"] = target_language.strip()
            return safe
        return {}

    if op_type == "filter_rows":
        column = params.get("column")
        if not isinstance(column, str):
            return None
        if available_columns and column not in available_columns:
            return None
        operator = params.get("operator", "==")
        if operator not in {"==", "!=", ">", ">=", "<", "<=", "contains", "startswith", "endswith"}:
            operator = "=="
        safe["column"] = column
        safe["operator"] = operator
        safe["value"] = params.get("value")
        return safe

    if op_type == "pivot_table":
        index_cols = _only_existing_columns(params.get("group_by", params.get("index", [])), available_columns)
        value_cols = _only_existing_columns(params.get("values", []), available_columns)
        if not index_cols:
            return None
        safe["group_by"] = index_cols
        if value_cols:
            safe["values"] = value_cols
        aggfunc = str(params.get("aggfunc", "sum")).lower()
        if aggfunc not in {"sum", "mean", "count", "min", "max"}:
            aggfunc = "sum"
        safe["aggfunc"] = aggfunc
        return safe

    if op_type == "unpivot":
        id_vars = _only_existing_columns(params.get("id_vars", []), available_columns)
        value_vars = _only_existing_columns(params.get("value_vars", []), available_columns)
        safe["id_vars"] = id_vars
        if value_vars:
            safe["value_vars"] = value_vars
        var_name = params.get("var_name", "variable")
        value_name = params.get("value_name", "value")
        safe["var_name"] = str(var_name)
        safe["value_name"] = str(value_name)
        return safe

    if op_type == "split_column":
        column = params.get("column")
        if not isinstance(column, str):
            return None
        if available_columns and column not in available_columns:
            return None
        delimiter = params.get("delimiter", " ")
        if not isinstance(delimiter, str) or delimiter == "":
            delimiter = " "
        into = params.get("into")
        if into and isinstance(into, list):
            safe["into"] = [str(x) for x in into if isinstance(x, str) and str(x).strip()]
        safe["column"] = column
        safe["delimiter"] = delimiter
        return safe

    if op_type == "merge_columns":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        new_column = params.get("new_column")
        if not cols or not isinstance(new_column, str):
            return None
        safe["columns"] = cols
        safe["new_column"] = new_column
        separator = params.get("separator", " ")
        safe["separator"] = separator if isinstance(separator, str) else " "
        return safe

    if op_type == "trim_text":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if not cols:
            return None
        safe["columns"] = cols
        return safe

    if op_type == "replace_values":
        column = params.get("column")
        mapping = params.get("mapping")
        if not isinstance(column, str) or not isinstance(mapping, dict) or not mapping:
            return None
        if available_columns and column not in available_columns:
            return None
        safe["column"] = column
        safe["mapping"] = mapping
        return safe

    if op_type == "format_datetime":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if not cols:
            return None
        fmt = params.get("format", "%Y-%m-%d")
        safe["columns"] = cols
        safe["format"] = str(fmt)
        return safe

    if op_type == "add_rank":
        sort_by = params.get("sort_by")
        new_column = params.get("new_column", "rank")
        if not isinstance(sort_by, str) or not isinstance(new_column, str):
            return None
        if available_columns and sort_by not in available_columns:
            return None
        safe["sort_by"] = sort_by
        safe["new_column"] = new_column
        safe["ascending"] = bool(params.get("ascending", False))
        return safe

    if op_type in {"running_total", "percentage_of_total"}:
        source_column = params.get("source_column")
        new_column = params.get("new_column")
        if not isinstance(source_column, str) or not isinstance(new_column, str):
            return None
        if available_columns and source_column not in available_columns:
            return None
        safe["source_column"] = source_column
        safe["new_column"] = new_column
        group_by = _only_existing_columns(params.get("group_by", []), available_columns)
        if group_by:
            safe["group_by"] = group_by
        return safe

    if op_type == "clip_outliers":
        cols = _only_existing_columns(params.get("columns"), available_columns)
        if not cols:
            return None
        try:
            lower_q = float(params.get("lower_quantile", 0.01))
            upper_q = float(params.get("upper_quantile", 0.99))
        except (TypeError, ValueError):
            lower_q, upper_q = 0.01, 0.99
        lower_q = min(max(lower_q, 0.0), 0.49)
        upper_q = min(max(upper_q, 0.51), 1.0)
        if lower_q >= upper_q:
            lower_q, upper_q = 0.01, 0.99
        safe["columns"] = cols
        safe["lower_quantile"] = lower_q
        safe["upper_quantile"] = upper_q
        return safe

    return None


def validate_plan(
    plan: List[Dict[str, Any]],
    available_columns: Optional[List[str]] = None
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Validate and sanitize action plan. Returns only valid operations.
    Rejects any operation not in whitelist.
    """
    validated: List[Dict[str, Any]] = []
    warnings: List[str] = []

    # Ensure plan is iterable/list-like
    if not isinstance(plan, list):
        warnings.append("Plan is not a list; nothing to execute.")
        return validated, warnings

    for idx, raw_op in enumerate(plan):
        op = raw_op
        # Accept list/tuple forms produced by some LLM responses: [type, params]
        if isinstance(raw_op, (list, tuple)):
            if len(raw_op) >= 1 and isinstance(raw_op[0], str):
                params_candidate = raw_op[1] if len(raw_op) > 1 and isinstance(raw_op[1], dict) else {}
                op = {"type": raw_op[0], "params": params_candidate}
            else:
                warnings.append(f"Step {idx + 1}: skipped unsupported list/tuple operation format.")
                continue

        if not isinstance(op, dict):
            warnings.append(f"Step {idx + 1}: skipped non-object operation.")
            continue
        op_type = op.get("type")
        if op_type not in ALLOWED_OPERATIONS:
            warnings.append(f"Step {idx + 1}: skipped unsupported operation '{op_type}'.")
            continue
        params = op.get("params", {}) or {}
        if not isinstance(params, dict):
            params = {}
        safe_params = _sanitize_op(op_type, params, available_columns)
        if safe_params is None:
            warnings.append(f"Step {idx + 1}: removed invalid parameters for '{op_type}'.")
            continue
        validated.append({"type": op_type, "params": safe_params})
    return validated, warnings
