from google import genai
from ..config.settings import settings

client = genai.Client(api_key=settings.gemini_api_key)

def generate_response(context, query):
    prompt = f"""You are a precise AI assistant. Answer the user's question based strictly on the provided document context.

If the answer is not in the Context, reply EXACTLY with: "I'm sorry, but I cannot find the answer in the uploaded document." Do not use outside knowledge.

Context:
{context}

Question:
{query}

Answer:
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"API Error: {str(e)}"