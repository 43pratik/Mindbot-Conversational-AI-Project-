from fastapi import APIRouter, HTTPException
from ..models.schema import AgentRequest, AgentResponse
from ..services.agent_executor import execute_agent
from ..services.safety_service import check_content_safety

router = APIRouter()

@router.post("/agent", response_model=AgentResponse)
async def handle_agent_query(request: AgentRequest):
    try:
        # 1. RUN THE SAFETY CHECK FIRST
        safety_result = check_content_safety(request.query)
        
        # 2. IF UNSAFE, BLOCK THE REQUEST AND RETURN
        if not safety_result["is_safe"]:
            return AgentResponse(
                query=request.query, 
                response=f"Blocked: {safety_result['reason']}"
            )
            
        # 3. IF SAFE, PROCEED NORMALLY TO THE AGENT
        answer = execute_agent(request.query)
        
        return AgentResponse(query=request.query, response=answer)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))