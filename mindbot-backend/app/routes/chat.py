from fastapi import APIRouter, HTTPException
from ..models.schema import ChatRequest, ChatResponse
from ..services.safety_service import check_content_safety
from app.services.rag_pipeline import rag_pipeline

router = APIRouter()
chat_history_db = {} 

@router.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    try:
        session = request.session_id
        user_query = request.query

        # 1. Safety Check
        safety_result = check_content_safety(user_query)
        if not safety_result["is_safe"]:
            return ChatResponse(
                session_id=session, 
                response=f"SYSTEM BLOCK: {safety_result['reason']}"
            )

        if session not in chat_history_db:
            chat_history_db[session] = [] 

        # 2. Direct RAG Call (Bypasses the Agent entirely)
        ai_response = rag_pipeline.process_query(user_query)

        # 3. Save Memory
        chat_history_db[session].append(f"User: {user_query}")
        chat_history_db[session].append(f"MindBot: {ai_response}")

        return ChatResponse(
            session_id=session, 
            response=ai_response
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))