from google import genai
from google.genai import types
from ..config.settings import settings

# Import your existing RAG function!
from app.services.rag_pipeline import rag_pipeline

client = genai.Client(api_key=settings.gemini_api_key)

# ---------------------------------------------------------
# 1. THE AGENT'S TOOLBOX
# ---------------------------------------------------------
def calculator(expression: str) -> str:
    """Evaluates a mathematical expression and returns the result. Use this for math problems."""
    try:
        # Safe evaluation
        allowed_chars = "0123456789+-*/(). "
        if any(c not in allowed_chars for c in expression):
            return "Error: Invalid characters in expression."
        return str(eval(expression))
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"

def web_search(query: str) -> str:
    """Searches the web for current events or general knowledge."""
    return f"Simulated search results for '{query}': Information successfully retrieved."

def search_uploaded_document(query: str) -> str:
    """Searches the user's uploaded PDF/document. ALWAYS use this first if the user asks about their file, document, formulas, or uploaded context."""
    return rag_pipeline.process_query(query)

# ---------------------------------------------------------
# 2. THE AUTONOMOUS BRAIN
# ---------------------------------------------------------
def execute_agent(query: str) -> str:
    tools = [calculator, web_search, search_uploaded_document]
    
    prompt = f"""You are MindBot's Autonomous Agent. 
    Analyze the user's query and use the appropriate tool to answer it.
    - If it's a math problem, use the calculator.
    - If it asks about a document, PDF, or specific formulas, use the search_uploaded_document tool.
    - If it's general knowledge, use the web_search tool.
    
    CRITICAL INSTRUCTION: When you use a tool, you MUST output the EXACT data, facts, and numbers returned by the tool. DO NOT just say "I retrieved the information." Tell the user exactly what the information is.
    
    User Query: {query}"""
    
    try:
        # Use client.chats.create for automatic tool execution
        chat = client.chats.create(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                tools=tools,
                temperature=0.2, 
            )
        )
        response = chat.send_message(prompt)
        return response.text
    except Exception as e:
        return f"Agent Error: {str(e)}"