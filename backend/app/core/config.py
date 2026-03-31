import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv


_BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(dotenv_path=_BACKEND_DIR / ".env", override=True)


def _clean_env(value: str) -> str:
    return (value or "").strip().strip('"').strip("'")


def _gemini_api_key() -> str:
    # Strictly read the official key only.
    return _clean_env(os.getenv("GEMINI_API_KEY", ""))


class Settings(BaseModel):
    PROJECT_NAME: str = "AutoDW-Lite"
    GEMINI_API_KEY: str = _gemini_api_key()
    GEMINI_MODEL: str = _clean_env(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    GEMINI_TIMEOUT_SEC: int = int(os.getenv("GEMINI_TIMEOUT_SEC", "45"))
    UPLOAD_DIR: str = "uploads"
    # Legacy provider settings (unused in Gemini-only mode)
    USE_OLLAMA: bool = os.getenv("USE_OLLAMA", "false").lower() in ("true", "1", "yes")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    # Legacy fallback model setting
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "Qwen/Qwen2.5-0.5B-Instruct")

settings = Settings()

# Create upload dir if not exists
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
