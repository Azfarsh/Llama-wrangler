import os
import sys
from pathlib import Path

from dotenv import load_dotenv  # type: ignore[import-untyped]
from google import genai  # type: ignore[import-untyped]


def mask_key(value: str) -> str:
    if not value:
        return "(missing)"
    if len(value) <= 10:
        return "*" * len(value)
    return f"{value[:8]}...{value[-4:]}"


def main() -> int:
    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env", override=False)

    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GENAI_API_KEY")
        or ""
    ).strip().strip('"').strip("'")

    print(f"Using API key: {mask_key(api_key)}")
    if not api_key:
        print("FAIL: No API key found. Set GEMINI_API_KEY in backend/.env")
        return 1

    try:
        client = genai.Client(api_key=api_key)
        direct = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents="Reply with exactly: GEMINI_OK",
        )
        direct_text = (getattr(direct, "text", "") or "").strip()
        print(f"Direct SDK call: {direct_text}")
        if "GEMINI_OK" not in direct_text:
            print("FAIL: Unexpected direct SDK response.")
            return 1
    except Exception as exc:
        print(f"FAIL: Direct SDK call failed: {exc}")
        return 1

    try:
        sys.path.insert(0, str(backend_dir))
        from app.services.excel_ai_service import ExcelAIService

        service = ExcelAIService()
        if not service.client:
            print("FAIL: ExcelAIService did not initialize Gemini client.")
            return 1
        payload = service._gemini_generate_json(
            user_message="Only explain this sheet in read-only mode.",
            sheet_json={"Sheet1": {"A1": {"value": "Name"}, "A2": {"value": "Bike"}}},
        )
        if not isinstance(payload, dict):
            print("FAIL: ExcelAIService returned non-dict payload.")
            return 1
        print("Backend service call: OK")
    except Exception as exc:
        print(f"FAIL: Backend service call failed: {exc}")
        return 1

    print("SUCCESS: Gemini API key is valid and backend integration works.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
