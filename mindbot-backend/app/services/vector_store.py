import os
import shutil
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

class VectorStore:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5" 
        )
        self.index = None
        self.db_path = "data/vector_db"
        os.makedirs(self.db_path, exist_ok=True)
        if os.path.exists(os.path.join(self.db_path, "index.faiss")):
            self.index = FAISS.load_local(self.db_path, self.embeddings, allow_dangerous_deserialization=True)

    def clear_database(self):
        """Wipes the old vector database before uploading a new file."""
        self.index = None
        if os.path.exists(self.db_path):
            shutil.rmtree(self.db_path)
        os.makedirs(self.db_path, exist_ok=True)

    def add_documents(self, chunks):
        if self.index is None:
            self.index = FAISS.from_texts(chunks, self.embeddings)
        else:
            self.index.add_texts(chunks)
        self.index.save_local(self.db_path)

    def search(self, query, k=15): # Increased to 15 to easily fit whole resumes
        if self.index is None:
            return []
        docs = self.index.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]

vector_store = VectorStore()