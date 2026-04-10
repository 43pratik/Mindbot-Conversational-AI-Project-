from .vector_store import vector_store
from google import genai
from ..config.settings import settings

client = genai.Client(api_key=settings.gemini_api_key)

class RAGPipeline:
    def __init__(self):
        self.vector_store = vector_store

    def process_query(self, query):
        # 1. Let FAISS do its pure mathematical search (k=15 grabs almost the whole resume)
        context_docs = self.vector_store.search(query, k=15)

        if not context_docs:
            return "No documents found. Please upload a file first."

        # 2. Clean up duplicates
        unique_chunks = list(set(context_docs))
        context = "\n\n".join(unique_chunks)

        # 3. Exactly ONE call to Gemini
        # 3. Exactly ONE call to Gemini (Hybrid Mode)
        prompt = f"""
        You are MindBot, an intelligent assistant. 
        
        Step 1: Check if the user's question can be answered using the Document Context below. If it can, answer it fully and accurately based on the text.
        Step 2: If the question is general knowledge (like "What is the capital of France?" or "What is 2+2?") and is NOT in the context, go ahead and answer it using your own general AI knowledge.
        
        Document Context:
        {context}
        
        Question: {query}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"API Error: {str(e)}"

rag_pipeline = RAGPipeline()