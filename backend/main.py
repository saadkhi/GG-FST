# Update main.py
import os
import time
import tempfile
import mimetypes
import magic
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional, List, BinaryIO

from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

# Validate required environment variables
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("GEMINI_API_KEY environment variable is not set")

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Models
class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []

# -----------------------------
# 1. UPLOAD ROUTE
# -----------------------------
@app.post("/upload")
async def upload_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_types = [
        'application/pdf', 
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream'  # For docx files that might not have the correct mime
    ]
    
    try:
        # Read the file content to detect mime type
        content = await file.read()
        print(f"File content length: {len(content)} bytes")  # Debug log
        
        # First try to get mime type from magic
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(content)
        print(f"Detected mime type (magic): {mime_type}")  # Debug log
        
        # If magic can't determine, try mimetypes as fallback
        if mime_type == 'application/octet-stream' or not mime_type:
            file_extension = os.path.splitext(file.filename)[1].lower()
            mime_type = mimetypes.guess_type(f'file{file_extension}')[0] or 'application/octet-stream'
            print(f"Falling back to extension-based mime type: {mime_type}")  # Debug log
        
        # Reset file pointer
        await file.seek(0)
        
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"File type '{mime_type}' not supported. Please upload a PDF, TXT, or Word document. Allowed types: {', '.join(allowed_types)}"
            )
            
    except Exception as e:
        print(f"Error detecting mime type: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=400, 
            detail=f"Error processing file: {str(e)}"
        )

    try:
        # Create File Search Store
        store = client.file_search_stores.create()
        print(f"Store object type: {type(store)}")  # Debug
        print(f"Store object: {store}")  # Debug
        store_name = store.name
        print(f"Store name type: {type(store_name)}, value: {store_name}")  # Debug

        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # Upload file to the file search store
            with open(tmp_path, 'rb') as f:
                print(f"File object type: {type(f)}, has name: {hasattr(f, 'name')}")  # Debug
                upload_op = client.file_search_stores.upload_to_file_search_store(
                    file_search_store_name=store_name,
                    file=f,
                    config=types.UploadToFileSearchStoreConfig(
                        mime_type=mime_type
                    )
                )
                print(f"Upload operation type: {type(upload_op)}")  # Debug
                print(f"Upload operation: {upload_op}")  # Debug

                # Wait for processing completion by polling
                max_retries = 120  # 4 minutes max wait
                retry_count = 0
                while not upload_op.done and retry_count < max_retries:
                    time.sleep(2)
                    retry_count += 1
                    print(f"Polling status (attempt {retry_count}): done={upload_op.done}")  # Debug
                    try:
                        # Refresh operation - pass operation object directly, not the name
                        upload_op = client.operations.get(name=upload_op.name)
                    except Exception as poll_error:
                        print(f"Poll error: {poll_error}, retrying...")  # Debug
                        continue

            print(f"Upload operation completed: {upload_op}")  # Debug
            return {"store_id": store_name}

        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # Debug
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# -----------------------------
# 2. CHAT ROUTE
# -----------------------------
@app.post("/chat", response_model=ChatResponse)
async def chat(store_id: str = Form(...), prompt: str = Form(...)):
    try:
        if not store_id or not prompt:
            raise HTTPException(status_code=400, detail="Missing required fields")

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        file_search=types.FileSearch(
                            file_search_store_names=[store_id]
                        )
                    )
                ]
            )
        )

        answer = response.text
        sources = []

        if hasattr(response, 'candidates') and response.candidates:
            grounding = response.candidates[0].grounding_metadata
            if grounding and hasattr(grounding, 'grounding_chunks'):
                # Extract titles, filtering out None values
                sources = list({c.retrieved_context.title for c in grounding.grounding_chunks 
                              if hasattr(c, 'retrieved_context') and hasattr(c.retrieved_context, 'title')
                              and c.retrieved_context.title is not None})

        return {
            "answer": answer,
            "sources": sources
        }

    except Exception as e:
        # Handle Google API 503 error gracefully
        if hasattr(e, 'args') and e.args and '503' in str(e.args[0]):
            raise HTTPException(status_code=503, detail="The Gemini model is overloaded or temporarily unavailable. Please try again in a few moments.")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")