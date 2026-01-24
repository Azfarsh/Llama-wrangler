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
        Analyze user intent and generate a high-level goal using Gemini.
        """
        if not self.model:
            return {"error": "LLM not configured"}

        prompt = f"""
        You are an intelligent data science assistant.
        User Query: "{user_query}"
        Dataset Metadata: {json.dumps(dataset_metadata, indent=2)}

        Identify the user's data wrangling goal.
        Return a JSON object with:
        - "goal": A concise summary of the goal.
        - "requires_cleaning": Boolean.
        - "requires_transformation": Boolean.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Simple cleanup of markdown code blocks if present
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            return {"error": str(e)}

    async def generate_plan(self, user_query: str, dataset_metadata: dict) -> list:
        """
        Generate a step-by-step deterministic plan.
        The plan should be a list of operations.
        Supported Operations:
        - drop_columns: {columns: [list]}
        - drop_na: {columns: [list], how: 'any'|'all'}
        - fill_na: {columns: [list], value: any, method: 'mean'|'median'|'mode'|'bfill'|'ffill'}
        - rename_columns: {mapping: {old: new}}
        - filter_rows: {column: str, condition: '>', value: any} (simplified)
        - convert_type: {columns: [list], target_type: 'int'|'float'|'str'|'datetime'}
        - remove_duplicates: {subset: [list]}
        """
        if not self.model:
            return []

        prompt = f"""
        You are an expert Data Wrangler.
        User Query: "{user_query}"
        Dataset Metadata: {json.dumps(dataset_metadata, indent=2)}

        Generate a deterministic execution plan to achieve the user's goal.
        The plan MUST be a JSON array of operations.
        Each operation must have a "type" and "params".

        Supported Operation Types:
        1. "drop_columns": params -> "columns": [str]
        2. "drop_na": params -> "columns": [str] (optional), "how": "any"
        3. "fill_na": params -> "columns": [str], "value": val OR "method": "mean"/"median"/"mode"
        4. "rename_columns": params -> "mapping": {{old_name: new_name}}
        5. "convert_type": params -> "columns": [str], "target_type": "int"/"float"/"str"/"datetime"
        6. "remove_duplicates": params -> "subset": [str] (optional)

        Return ONLY the JSON array.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"Plan Generation Error: {e}")
            return []
