import google.generativeai as genai
from app.core.config import settings
import json

class LLMService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            print("Warning: GEMINI_API_KEY not set.")
            self.model = None

    async def analyze_intent(self, user_query: str, dataset_metadata: dict) -> dict:
        """
        Agent 1: Intent Understanding Agent
        Analyzes user's natural language query and identifies purpose, transformations, and expectations.
        """
        if not self.model:
            return {"error": "LLM not configured", "goal": "Process dataset", "purpose": "general", "requires_cleaning": True, "requires_transformation": True}

        prompt = f"""You are an Intent Understanding Agent for a data wrangling system.

User Query: "{user_query}"

Dataset Overview:
- Total Rows: {dataset_metadata.get('total_rows', 'N/A')}
- Total Columns: {dataset_metadata.get('total_columns', 'N/A')}
- Numeric Columns: {len(dataset_metadata.get('numeric_columns', []))}
- Text Columns: {len(dataset_metadata.get('text_columns', []))}
- Missing Values: {sum(dataset_metadata.get('missing_values', {}).values())} total

Analyze the user's intent and identify:
1. Purpose: What is the dataset intended for? (ML classification, ML regression, analytics, BI dashboard, reporting, etc.)
2. Required transformations: What specific data wrangling steps are needed?
3. Output expectations: What should the final dataset look like?

Return a JSON object with:
{{
    "goal": "A concise summary of what the user wants to achieve",
    "purpose": "ml_classification" | "ml_regression" | "analytics" | "bi_dashboard" | "reporting" | "general",
    "requires_cleaning": true/false,
    "requires_transformation": true/false,
    "key_requirements": ["list", "of", "specific", "requirements"]
}}

Return ONLY valid JSON, no markdown formatting."""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace("```json", "").replace("```", "").strip()
            result = json.loads(text)
            return result
        except Exception as e:
            print(f"Intent Analysis Error: {e}")
            return {
                "goal": "Process and clean the dataset",
                "purpose": "general",
                "requires_cleaning": True,
                "requires_transformation": True,
                "key_requirements": ["clean data", "handle missing values"]
            }

    async def generate_plan(self, user_query: str, dataset_metadata: dict, intent: dict = None) -> list:
        """
        Agent 2: Planning Agent
        Converts intent + metadata into a step-by-step execution plan.
        """
        if not self.model:
            return []

        intent_str = json.dumps(intent, indent=2) if intent else "Not provided"
        
        prompt = f"""You are a Planning Agent for data wrangling. Generate a step-by-step execution plan.

User Query: "{user_query}"

Intent Analysis: {intent_str}

Dataset Metadata:
- Columns: {dataset_metadata.get('columns', [])}
- Numeric Columns: {dataset_metadata.get('numeric_columns', [])}
- Text Columns: {dataset_metadata.get('text_columns', [])}
- Categorical Columns: {dataset_metadata.get('categorical_columns', [])}
- Missing Values: {dataset_metadata.get('missing_values', {})}
- Duplicate Rows: {dataset_metadata.get('duplicate_rows', 0)}
- Constant Columns: {dataset_metadata.get('constant_columns', [])}

Generate a JSON array of operations to execute in order. Each operation must have:
- "type": operation type (string)
- "params": parameters object (dict)

Supported Operation Types:
1. "drop_columns": {{"columns": ["col1", "col2"]}}
2. "drop_constant_columns": {{}} (no params needed)
3. "drop_na": {{"columns": ["col1"] (optional), "how": "any"|"all"}}
4. "fill_na": {{"columns": ["col1"], "value": 0}} OR {{"columns": ["col1"], "method": "mean"|"median"|"mode"}}
5. "rename_columns": {{"mapping": {{"old_name": "new_name"}}}}
6. "convert_type": {{"columns": ["col1"], "target_type": "int"|"float"|"str"|"datetime"}}
7. "remove_duplicates": {{"subset": ["col1"] (optional)}}
8. "encode_categorical": {{"columns": ["col1", "col2"]}}
9. "extract_datetime_features": {{"columns": ["date_col"]}}
10. "vectorize_text": {{"columns": ["text_col"], "max_features": 50}}
11. "normalize_numeric": {{"columns": ["num_col1", "num_col2"]}}

Important:
- For ML purposes, consider encoding categoricals, normalizing numerics, and vectorizing text
- Always handle missing values appropriately
- Remove duplicates and constant columns when relevant
- Return operations in logical order

Return ONLY a JSON array, no markdown formatting."""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace("```json", "").replace("```", "").strip()
            plan = json.loads(text)
            if not isinstance(plan, list):
                plan = [plan]
            return plan
        except Exception as e:
            print(f"Plan Generation Error: {e}")
            print(f"Response was: {response.text if 'response' in locals() else 'N/A'}")
            # Return a basic plan as fallback
            return [
                {"type": "drop_constant_columns", "params": {}},
                {"type": "remove_duplicates", "params": {}},
                {"type": "fill_na", "params": {"method": "mean"}}
            ]

    async def generate_insights(self, original_metadata: dict, processed_metadata: dict, execution_log: list, intent: dict) -> dict:
        """
        Agent 3: Validation & Insight Agent
        Validates the final dataset and generates insights, use cases, and transformation summary.
        """
        if not self.model:
            return {
                "summary": "Dataset processed successfully",
                "insights": ["Data has been cleaned and transformed"],
                "use_cases": ["Machine Learning", "Analytics"],
                "transformations": execution_log
            }

        prompt = f"""You are a Validation & Insight Agent. Analyze the data wrangling results.

Original Dataset:
- Rows: {original_metadata.get('total_rows', 0)}
- Columns: {original_metadata.get('total_columns', 0)}
- Missing Values: {sum(original_metadata.get('missing_values', {}).values())}

Processed Dataset:
- Rows: {processed_metadata.get('total_rows', 0)}
- Columns: {processed_metadata.get('total_columns', 0)}
- Missing Values: {sum(processed_metadata.get('missing_values', {}).values())}

Transformations Performed:
{json.dumps(execution_log, indent=2)}

User Intent: {json.dumps(intent, indent=2)}

Generate a comprehensive analysis with:
1. Summary of transformations
2. Key insights about the dataset
3. Suggested use cases (ML classification, regression, BI, analytics, etc.)
4. Data quality assessment

Return JSON:
{{
    "summary": "Brief summary of what was done",
    "insights": ["insight 1", "insight 2", "insight 3"],
    "use_cases": ["use case 1", "use case 2"],
    "data_quality": "excellent" | "good" | "fair" | "needs_attention",
    "transformation_summary": "Detailed summary of transformations"
}}

Return ONLY valid JSON, no markdown formatting."""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"Insight Generation Error: {e}")
            return {
                "summary": "Dataset has been successfully processed",
                "insights": [
                    f"Processed {processed_metadata.get('total_rows', 0)} rows",
                    f"Final dataset has {processed_metadata.get('total_columns', 0)} columns"
                ],
                "use_cases": ["Machine Learning", "Business Analytics", "Reporting"],
                "data_quality": "good",
                "transformation_summary": f"Applied {len(execution_log)} transformations"
            }
