import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AutoDW-Lite"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    UPLOAD_DIR: str = "uploads"

settings = Settings()

# Create upload dir if not exists
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
