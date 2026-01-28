import pandas as pd
import io
import os
import numpy as np
from typing import List, Dict, Any
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
import json

class DataService:
    @staticmethod
    def load_dataset(file_path: str) -> pd.DataFrame:
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            return pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")

    @staticmethod
    def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate comprehensive metadata about the dataset.
        """
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        text_cols = df.select_dtypes(include=['object']).columns.tolist()
        categorical_cols = [col for col in text_cols if df[col].nunique() < 50]
        
        profile = {
            "total_rows": int(df.shape[0]),
            "total_columns": int(df.shape[1]),
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "missing_percentage": (df.isnull().sum() / len(df) * 100).to_dict(),
            "shape": df.shape,
            "head": df.head(10).to_dict(orient='records'),
            "numeric_columns": numeric_cols,
            "text_columns": text_cols,
            "categorical_columns": categorical_cols,
            "duplicate_rows": int(df.duplicated().sum()),
            "constant_columns": [col for col in df.columns if df[col].nunique() <= 1],
            "summary": {}
        }
        
        # Add statistical summary for numeric columns
        if numeric_cols:
            profile["summary"]["numeric"] = df[numeric_cols].describe().to_dict()
        
        # Add value counts for categorical columns
        if categorical_cols:
            profile["summary"]["categorical"] = {
                col: df[col].value_counts().head(10).to_dict() 
                for col in categorical_cols[:5]  # Limit to first 5 to avoid huge output
            }
        
        return DataService._sanitize_for_json(profile)

    @staticmethod
    def _sanitize_for_json(data: Any) -> Any:
        if isinstance(data, dict):
            return {k: DataService._sanitize_for_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [DataService._sanitize_for_json(v) for v in data]
        elif isinstance(data, float):
            if np.isnan(data) or np.isinf(data):
                return None
        elif isinstance(data, (np.int64, np.int32)):
            return int(data)
        elif isinstance(data, (np.float64, np.float32)):
             if np.isnan(data) or np.isinf(data):
                return None
             return float(data)
        return data

    @staticmethod
    def execute_plan(df: pd.DataFrame, plan: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Execute a list of operations on the DataFrame deterministically.
        Enhanced with more transformation operations.
        """
        df_processed = df.copy()
        execution_log = []

        for op in plan:
            op_type = op.get("type")
            params = op.get("params", {})

            try:
                if op_type == "drop_columns":
                    cols = params.get("columns", [])
                    df_processed.drop(columns=cols, errors='ignore', inplace=True)
                    execution_log.append(f"Dropped columns: {cols}")
                
                elif op_type == "drop_constant_columns":
                    constant_cols = [col for col in df_processed.columns if df_processed[col].nunique() <= 1]
                    df_processed.drop(columns=constant_cols, errors='ignore', inplace=True)
                    execution_log.append(f"Dropped constant columns: {constant_cols}")
                
                elif op_type == "drop_na":
                    cols = params.get("columns")
                    how = params.get("how", "any")
                    rows_before = len(df_processed)
                    if cols:
                        df_processed.dropna(subset=cols, how=how, inplace=True)
                    else:
                        df_processed.dropna(how=how, inplace=True)
                    rows_removed = rows_before - len(df_processed)
                    execution_log.append(f"Removed {rows_removed} rows with missing values")

                elif op_type == "fill_na":
                    cols = params.get("columns", [])
                    val = params.get("value")
                    method = params.get("method")
                    
                    if not cols:
                        cols = df_processed.columns.tolist()

                    if val is not None:
                        df_processed[cols] = df_processed[cols].fillna(val)
                        execution_log.append(f"Filled missing values in {cols} with {val}")
                    elif method in ['mean', 'median', 'mode']:
                        for col in cols:
                            if col in df_processed.select_dtypes(include=['number']).columns:
                                if method == 'mean':
                                    fill_val = df_processed[col].mean()
                                elif method == 'median':
                                    fill_val = df_processed[col].median()
                                df_processed[col] = df_processed[col].fillna(fill_val)
                            elif method == 'mode':
                                if not df_processed[col].mode().empty:
                                    fill_val = df_processed[col].mode()[0]
                                    df_processed[col] = df_processed[col].fillna(fill_val)
                        execution_log.append(f"Filled missing values using {method} method")

                elif op_type == "rename_columns":
                    mapping = params.get("mapping", {})
                    df_processed.rename(columns=mapping, inplace=True)
                    execution_log.append(f"Renamed columns: {mapping}")

                elif op_type == "convert_type":
                    cols = params.get("columns", [])
                    target = params.get("target_type")
                    for col in cols:
                        if col in df_processed.columns:
                            if target == 'int':
                                df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce').fillna(0).astype(int)
                            elif target == 'float':
                                df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
                            elif target == 'datetime':
                                df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                            elif target == 'str':
                                df_processed[col] = df_processed[col].astype(str)
                    execution_log.append(f"Converted {cols} to {target}")
                
                elif op_type == "remove_duplicates":
                    subset = params.get("subset")
                    rows_before = len(df_processed)
                    df_processed.drop_duplicates(subset=subset, inplace=True)
                    rows_removed = rows_before - len(df_processed)
                    execution_log.append(f"Removed {rows_removed} duplicate rows")
                
                elif op_type == "encode_categorical":
                    cols = params.get("columns", [])
                    for col in cols:
                        if col in df_processed.columns:
                            le = LabelEncoder()
                            df_processed[col] = le.fit_transform(df_processed[col].astype(str))
                    execution_log.append(f"Label encoded categorical columns: {cols}")
                
                elif op_type == "extract_datetime_features":
                    cols = params.get("columns", [])
                    for col in cols:
                        if col in df_processed.columns:
                            df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                            df_processed[f"{col}_year"] = df_processed[col].dt.year
                            df_processed[f"{col}_month"] = df_processed[col].dt.month
                            df_processed[f"{col}_day"] = df_processed[col].dt.day
                            df_processed[f"{col}_dayofweek"] = df_processed[col].dt.dayofweek
                    execution_log.append(f"Extracted datetime features from: {cols}")
                
                elif op_type == "vectorize_text":
                    cols = params.get("columns", [])
                    max_features = params.get("max_features", 50)
                    for col in cols:
                        if col in df_processed.columns:
                            vectorizer = TfidfVectorizer(max_features=max_features, stop_words='english')
                            text_data = df_processed[col].fillna('').astype(str)
                            vectors = vectorizer.fit_transform(text_data)
                            feature_names = [f"{col}_tfidf_{i}" for i in range(vectors.shape[1])]
                            df_vectors = pd.DataFrame(vectors.toarray(), columns=feature_names, index=df_processed.index)
                            df_processed = pd.concat([df_processed.drop(columns=[col]), df_vectors], axis=1)
                    execution_log.append(f"Vectorized text columns: {cols}")
                
                elif op_type == "normalize_numeric":
                    cols = params.get("columns", [])
                    numeric_cols = [col for col in cols if col in df_processed.select_dtypes(include=[np.number]).columns]
                    if numeric_cols:
                        scaler = StandardScaler()
                        df_processed[numeric_cols] = scaler.fit_transform(df_processed[numeric_cols])
                    execution_log.append(f"Normalized numeric columns: {numeric_cols}")

            except Exception as e:
                print(f"Error executing operation {op_type}: {e}")
                execution_log.append(f"Error in {op_type}: {str(e)}")
        
        return df_processed, execution_log
