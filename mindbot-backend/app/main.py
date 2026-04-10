from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, chat, voice
from app.routes import agent
from app.routes import upload, chat, voice, agent, vision
app = FastAPI(title="MindBot", description="AI Chatbot with RAG")

# Add this to allow browser microphone access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(agent.router, prefix="/api", tags=["Agent"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(voice.router, prefix="/api", tags=["Voice"])
app.include_router(vision.router, prefix="/api", tags=["Vision"]) 
#run using this command: uvicorn app.main:app --reload


