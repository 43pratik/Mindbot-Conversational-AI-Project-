from pydantic import BaseModel

# Upload
class UploadResponse(BaseModel):
    message: str

# Chat
class ChatRequest(BaseModel):
    session_id: str
    query: str

class ChatResponse(BaseModel):
    session_id: str
    response: str

# Voice
class VoiceResponse(BaseModel):
    query: str
    response: str

# Agent
class AgentRequest(BaseModel):
    query: str

class AgentResponse(BaseModel):
    query: str
    response: str