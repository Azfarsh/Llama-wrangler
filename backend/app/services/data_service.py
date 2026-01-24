import pandas as pd
import io
import os
from typing import List, Dict, Any

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
        Generate metadata about the dataset.
        """
        profile = {
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "shape": df.shape,
            "head": df.head(5).to_dict(orient='records'),
            "summary": df.describe(include='all').to_dict()
        }
        # Simplify summary for LLM consumption (remove NaNs or complex objects if needed)
        return profile

    @staticmethod
    def execute_plan(df: pd.DataFrame, plan: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Execute a list of operations on the DataFrame deterministically.
        """
        df_processed = df.copy()

        for op in plan:
            op_type = op.get("type")
            params = op.get("params", {})

            try:
                if op_type == "drop_columns":
                    cols = params.get("columns", [])
                    df_processed.drop(columns=cols, errors='ignore', inplace=True)
                
                elif op_type == "drop_na":
                    cols = params.get("columns")
                    how = params.get("how", "any")
                    if cols:
                        df_processed.dropna(subset=cols, how=how, inplace=True)
                    else:
                        df_processed.dropna(how=how, inplace=True)

                elif op_type == "fill_na":
                    cols = params.get("columns", [])
                    val = params.get("value")
                    method = params.get("method")
                    
                    if not cols:
                        cols = df_processed.columns

                    if val is not None:
                        df_processed[cols] = df_processed[cols].fillna(val)
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

                elif op_type == "rename_columns":
                    mapping = params.get("mapping", {})
                    df_processed.rename(columns=mapping, inplace=True)

                elif op_type == "convert_type":
                    cols = params.get("columns", [])
                    target = params.get("target_type")
                    for col in cols:
                        if target == 'int':
                            df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce').fillna(0).astype(int)
                        elif target == 'float':
                            df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
                        elif target == 'datetime':
                            df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                        elif target == 'str':
                            df_processed[col] = df_processed[col].astype(str)
                
                elif op_type == "remove_duplicates":
                    subset = params.get("subset")
                    df_processed.drop_duplicates(subset=subset, inplace=True)

            except Exception as e:
                print(f"Error executing operation {op_type}: {e}")
                # Continue or raise? For now, continue but log (print)
        
        return df_processed
