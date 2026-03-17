"""
Feature Type Inference (FTI) - rule-based version inspired by AutoDW paper.
Classifies columns into: numerical, categorical, datetime, sentence, url, embedded_number, list, ignorable_id, unit, sign, range, formatted_id.
Lightweight: no ML model training, uses heuristics + pandas.
"""
import re
import pandas as pd
import numpy as np
from typing import Dict, List, Any


# Feature types we support (subset of AutoDW Table 1)
FEATURE_TYPES = [
    "numerical", "categorical", "datetime", "sentence", "url",
    "embedded_number", "list", "ignorable_id", "unit", "sign", "range", "formatted_id"
]


def _sample_values(series: pd.Series, n: int = 5) -> List[str]:
    """Get non-null sample values as strings."""
    clean = series.dropna().astype(str).str.strip()
    if len(clean) == 0:
        return []
    if len(clean) <= n:
        return clean.tolist()
    indices = np.linspace(0, len(clean) - 1, n, dtype=int)
    return clean.iloc[indices].tolist()


def _is_numeric_string(s: str) -> bool:
    try:
        float(str(s).replace(",", "").replace(" ", ""))
        return True
    except (ValueError, TypeError):
        return False


def _is_datetime_string(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    try:
        pd.to_datetime(s)
        return True
    except Exception:
        return False


def _looks_like_url(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    s = str(s).strip().lower()
    return s.startswith("http://") or s.startswith("https://") or s.startswith("www.")


def _looks_like_list(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    s = str(s).strip()
    return (s.startswith("[") and s.endswith("]")) or ("[" in s and "]" in s)


def _has_embedded_number(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    return bool(re.search(r"\d{1,3}(?:,\d{3})*(?:\.\d+)?", str(s)))


def _has_unit(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    return bool(re.search(r"^\s*-?\d+(?:\.\d+)?\s*(kg|g|lb|oz|m|cm|km|mm|L|ml|%|°|years?|months?|days?)\s*$", str(s), re.I))


def _has_sign(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    s = str(s).strip()
    return s.startswith(">") or s.startswith("<") or s.startswith(">=") or s.startswith("<=") or s.lower().startswith("greater") or s.lower().startswith("less")


def _has_range(s: str) -> bool:
    if pd.isna(s) or not isinstance(s, str):
        return False
    return bool(re.search(r"^\s*-?\d+(?:\.\d+)?\s*-\s*-?\d+(?:\.\d+)?\s*$", str(s)))


def infer_feature_type(column_name: str, series: pd.Series) -> str:
    """
    Infer single feature type for a column using rules.
    Returns one of FEATURE_TYPES.
    """
    name_lower = (column_name or "").lower()
    samples = _sample_values(series, 5)
    n_unique = series.nunique()
    n_total = len(series.dropna())

    # Ignorable ID: constant column
    if n_unique <= 1:
        return "ignorable_id"
    # Pure ID: almost all unique values and name suggests ID
    if n_total > 0 and n_unique >= n_total * 0.99 and series.dtype == object:
        if "id" in name_lower or "key" in name_lower or "index" in name_lower:
            return "ignorable_id"

    # Numeric column (pandas already numeric)
    if pd.api.types.is_numeric_dtype(series):
        return "numerical"

    # Try parsing as numeric (object column with numbers)
    str_vals = series.dropna().astype(str)
    if len(str_vals) > 0:
        numeric_count = sum(1 for v in str_vals if _is_numeric_string(v))
        if numeric_count >= len(str_vals) * 0.9:
            return "numerical"

    # Datetime
    dt_count = sum(1 for v in samples if _is_datetime_string(v))
    if dt_count >= min(3, len(samples)) and ("date" in name_lower or "time" in name_lower or "year" in name_lower):
        return "datetime"
    if dt_count >= len(samples) * 0.8:
        return "datetime"

    # URL
    url_count = sum(1 for v in samples if _looks_like_url(v))
    if url_count >= min(2, len(samples)) or "url" in name_lower or "link" in name_lower:
        return "url"

    # List
    list_count = sum(1 for v in samples if _looks_like_list(v))
    if list_count >= min(2, len(samples)):
        return "list"

    # Embedded number (e.g. "1,234.56")
    emb_count = sum(1 for v in samples if _has_embedded_number(v) and not _is_numeric_string(v))
    if emb_count >= min(3, len(samples)):
        return "embedded_number"

    # Unit (e.g. "10 kg")
    unit_count = sum(1 for v in samples if _has_unit(v))
    if unit_count >= min(2, len(samples)):
        return "unit"

    # Sign (e.g. "> 5")
    sign_count = sum(1 for v in samples if _has_sign(v))
    if sign_count >= min(2, len(samples)):
        return "sign"

    # Range (e.g. "10-20")
    range_count = sum(1 for v in samples if _has_range(v))
    if range_count >= min(2, len(samples)):
        return "range"

    # Formatted ID (e.g. ISBN, container ID) - mixed alphanumeric with structure
    if "id" in name_lower or "isbn" in name_lower or "code" in name_lower:
        if any(len(str(v)) >= 6 and re.search(r"[A-Za-z].*\d|\d.*[A-Za-z]", str(v)) for v in samples):
            return "formatted_id"

    # Categorical: few unique values
    if n_unique <= 50 or (n_total > 0 and n_unique / n_total < 0.1):
        return "categorical"

    # Long text -> sentence
    avg_len = str_vals.str.len().mean()
    if avg_len > 30 or "review" in name_lower or "text" in name_lower or "description" in name_lower:
        return "sentence"

    # Default: categorical if few unique, else sentence
    return "categorical" if n_unique < 500 else "sentence"


def infer_dataset_fti(df: pd.DataFrame) -> Dict[str, str]:
    """Infer feature type for each column. Returns dict column_name -> feature_type."""
    return {col: infer_feature_type(col, df[col]) for col in df.columns}
