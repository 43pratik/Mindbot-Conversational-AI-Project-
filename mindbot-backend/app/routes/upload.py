from ..services.vector_store import vector_store
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models.schema import UploadResponse
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
from pathlib import Path

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs("data/raw_docs", exist_ok=True)
        
        safe_filename = Path(file.filename).name
        if not safe_filename:
            raise HTTPException(status_code=400, detail="Invalid file name")

        file_path = Path("data/raw_docs") / safe_filename
        with file_path.open("wb") as f:
            f.write(await file.read())

        if file_path.suffix.lower() != ".pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        loader = PyPDFLoader(str(file_path))
        documents = loader.load()

        if not documents:
            raise HTTPException(status_code=400, detail="PDF has no readable text")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800, 
            chunk_overlap=150,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        chunk_texts = [doc.page_content.replace('\x00', '') for doc in chunks if doc.page_content.strip()]

        if not chunk_texts:
            raise HTTPException(status_code=400, detail="No text extracted")

        # WIPE THE OLD MEMORY, THEN ADD THE NEW FILE
        vector_store.clear_database()
        vector_store.add_documents(chunk_texts)

        return UploadResponse(message=f"Processed {len(chunk_texts)} chunks successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))