from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from google import genai
from PIL import Image
import io
from ..config.settings import settings

router = APIRouter()
client = genai.Client(api_key=settings.gemini_api_key)

@router.post("/vision")
async def analyze_image(
    file: UploadFile = File(...), 
    query: str = Form(...)
):
    """
    Accepts an image file and a text query, then uses Gemini 2.5 Flash 
    to analyze the image and answer the user's question.
    """
    try:
        # 1. Read the uploaded image file into memory
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # 2. Send both the image and the text query to the model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image, query]
        )

        return {"query": query, "response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))