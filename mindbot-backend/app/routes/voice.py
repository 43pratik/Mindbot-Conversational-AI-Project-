from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
from app.services.whisper_service import transcribe_audio
from app.services.rag_pipeline import rag_pipeline

# Import your existing RAG/LLM logic here. 
# Depending on how you structured chat.py, you might import your LLM function like this:
# from app.services.rag_pipeline import generate_answer

router = APIRouter()
TEMP_DIR = "temp"

# Ensure temp directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/voice")
async def handle_voice_chat(file: UploadFile = File(...)):
    # 1. Save the uploaded audio file to the temp folder
    file_path = os.path.join(TEMP_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 2. Convert Audio to Text
        user_text = transcribe_audio(file_path)

        if not user_text:
            raise HTTPException(status_code=400, detail="Could not detect any speech in the audio.")

        # 3. Get the REAL answer from Gemini/RAG!
        # Pass the transcribed text into your existing AI function
        ai_response = rag_pipeline.process_query(user_text)
        
        return {
            "query": user_text,
            "response": ai_response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # 4. Clean up: Delete the temporary audio file so your server doesn't fill up
        if os.path.exists(file_path):
            os.remove(file_path)