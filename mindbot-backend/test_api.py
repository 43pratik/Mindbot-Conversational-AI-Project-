import requests
import os

# --- Configuration ---
BASE_URL = "http://127.0.0.1:8000/api"
TEST_PDF_PATH = "C:\\Users\\91914\\Downloads\\Internship_WeIntern\\Live project\\Projects_folder\\mindbot-backend\\data\\raw_docs\\TCS_NQT_Master_Formulas.pdf"  # Change this if your PDF has a different name

def test_rag_pipeline():
    print("Starting MindBot API Test...\n")

    # Step 1: Check if the PDF actually exists before trying to upload
    if not os.path.exists(TEST_PDF_PATH):
        print(f"Error: Could not find '{TEST_PDF_PATH}'.")
        print(f"Please put a PDF file named '{TEST_PDF_PATH}' in the exact same folder as this script.")
        return

    # Step 2: Test the Upload Endpoint
    print(f"1. Uploading '{TEST_PDF_PATH}' to the vector database...")
    try:
        with open(TEST_PDF_PATH, "rb") as f:
            upload_response = requests.post(f"{BASE_URL}/upload", files={"file": f})
        
        if upload_response.status_code == 200:
            print("Upload Success:", upload_response.json()["message"])
        else:
            print(f"Upload Failed (Status {upload_response.status_code}):", upload_response.text)
            return # Stop the test if upload fails
            
    except requests.exceptions.ConnectionError:
        print("Connection Error: Cannot reach the server.")
        print("Did you forget to start it? Run: uvicorn app.main:app --reload")
        return

    print("-" * 50)

    # Step 3: Test the Chat Endpoint
    query = "Summarize the core topic of this document in two sentences."
    print(f"2. Asking MindBot: '{query}'\n")

    chat_response = requests.post(f"{BASE_URL}/chat", json={"query": query})

    if chat_response.status_code == 200:
        print("AI Response:")
        print(chat_response.json().get("response"))
    else:
        print(f"Chat Failed (Status {chat_response.status_code}):", chat_response.text)

if __name__ == "__main__":
    test_rag_pipeline()