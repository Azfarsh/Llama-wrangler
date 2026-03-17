"""
Code Generator: produces executable Python script for the data wrangling pipeline (AutoDW-style).
Uses Jinja2 template for transparency and reproducibility.
"""
from jinja2 import Template
from typing import List, Dict, Any


SCRIPT_TEMPLATE = """# Auto-generated Data Wrangling Script (AutoDW-style)
# Generated from your wrangling session. Run: python wrangle.py

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer

# Load dataset
INPUT_PATH = "{{ input_path }}"
OUTPUT_PATH = "{{ output_path }}"

df = pd.read_csv(INPUT_PATH) if INPUT_PATH.endswith('.csv') else pd.read_excel(INPUT_PATH)
print(f"Loaded {{ df.shape[0] }} rows, {{ df.shape[1] }} columns")

# --- Wrangling steps ---
{% for op in operations %}
# Step {{ loop.index }}: {{ op.type }}
{% if op.type == 'drop_constant_columns' %}
constant_cols = [c for c in df.columns if df[c].nunique() <= 1]
df = df.drop(columns=constant_cols, errors='ignore')
{% elif op.type == 'drop_na' %}
cols = {{ op.params.get('columns', []) | tojson }}
if cols:
    df = df.dropna(subset=cols)
else:
    df = df.dropna()
{% elif op.type == 'remove_duplicates' %}
df = df.drop_duplicates()
{% elif op.type == 'drop_columns' %}
df = df.drop(columns={{ op.params.get('columns', []) | tojson }}, errors='ignore')
{% elif op.type == 'fill_na' %}
for col in df.select_dtypes(include=[np.number]).columns:
    df[col] = df[col].fillna(df[col].mean())
{% elif op.type == 'convert_type' %}
for col in {{ op.params.get('columns', []) | tojson }}:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
{% elif op.type == 'encode_categorical' %}
for col in {{ op.params.get('columns', []) | tojson }}:
    if col in df.columns:
        df[col] = LabelEncoder().fit_transform(df[col].astype(str))
{% elif op.type == 'extract_datetime_features' %}
for col in {{ op.params.get('columns', []) | tojson }}:
    if col in df.columns:
        df[col] = pd.to_datetime(df[col], errors='coerce')
        df[f"{col}_year"] = df[col].dt.year
        df[f"{col}_month"] = df[col].dt.month
        df[f"{col}_day"] = df[col].dt.day
        df[f"{col}_dayofweek"] = df[col].dt.dayofweek
{% elif op.type == 'vectorize_text' %}
for col in {{ op.params.get('columns', []) | tojson }}:
    if col in df.columns:
        tfidf = TfidfVectorizer(max_features={{ op.params.get('max_features', 50) }}, stop_words='english')
        X = tfidf.fit_transform(df[col].fillna('').astype(str))
        feat_names = [f"{col}_tfidf_{i}" for i in range(X.shape[1])]
        df = pd.concat([df.drop(columns=[col]), pd.DataFrame(X.toarray(), columns=feat_names, index=df.index)], axis=1)
{% elif op.type == 'normalize_numeric' %}
num_cols = [c for c in {{ op.params.get('columns', []) | tojson }} if c in df.columns and df[c].dtype in [np.number, 'float64', 'int64']]
if num_cols:
    df[num_cols] = StandardScaler().fit_transform(df[num_cols])
{% endif %}
{% endfor %}

# Save
df.to_csv(OUTPUT_PATH, index=False)
print(f"Saved to {OUTPUT_PATH}: {df.shape[0]} rows, {df.shape[1]} columns")
"""


def generate_wrangling_script(
    input_path: str,
    output_path: str,
    operations: List[Dict[str, Any]],
) -> str:
    """Generate executable Python script for the given plan."""
    template = Template(SCRIPT_TEMPLATE)
    return template.render(
        input_path=input_path,
        output_path=output_path,
        operations=operations,
    )
