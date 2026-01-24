from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.services.data_service import DataService
from app.services.llm_service import LLMService
from app.core.config import settings
import os
import pandas as pd
import uuid
import json

router = APIRouter()
data_service = DataService()
llm_service = LLMService()

# In-memory storage for session state (prototype only)
# In production, use a database or Redis
sessions = {}

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{session_id}{file_ext}")
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        df = data_service.load_dataset(file_path)
        profile = data_service.profile_dataset(df)
        
        sessions[session_id] = {
            "file_path": file_path,
            "original_df": df.to_dict(orient='records'), # Store small sample or careful with size
            # Actually, let's just store path and load on demand to avoid memory issues
            # But for "original_df" preview, we return head
        }
        
        return {
            "session_id": session_id,
            "filename": file.filename,
            "profile": profile
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@router.post("/analyze")
async def analyze_intent(request: dict = Body(...)):
    session_id = request.get("session_id")
    user_query = request.get("query")
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Reload df to get metadata (or cache metadata)
    file_path = sessions[session_id]["file_path"]
    df = data_service.load_dataset(file_path)
    profile = data_service.profile_dataset(df)
    
    # LLM Intent Analysis
    intent = await llm_service.analyze_intent(user_query, profile)
    
    # LLM Plan Generation
    plan = await llm_service.generate_plan(user_query, profile)
    
    return {
        "intent": intent,
        "plan": plan
    }

@router.post("/execute")
async def execute_plan(request: dict = Body(...)):
    session_id = request.get("session_id")
    plan = request.get("plan")
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    file_path = sessions[session_id]["file_path"]
    df = data_service.load_dataset(file_path)
    
    # Execute
    processed_df = data_service.execute_plan(df, plan)
    
    # Save processed file
    output_filename = f"{session_id}_processed.csv"
    output_path = os.path.join(settings.UPLOAD_DIR, output_filename)
    processed_df.to_csv(output_path, index=False)
    
    return {
        "message": "Execution successful",
        "preview": processed_df.head(10).to_dict(orient='records'),
        "summary": processed_df.describe(include='all').to_dict(),
        "download_url": f"/api/download/{output_filename}"
    }

from fastapi.responses import FileResponse

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
