import os
import time
import tempfile
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from google import genai
from google.genai import types

load_dotenv()
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


# -----------------------------
# 1. UPLOAD ROUTE
# -----------------------------
@app.post("/upload")
async def upload_file(file: UploadFile):

    # Create File Search Store
    store = client.file_search_stores.create()
    store_name = store.name

    # Save uploaded file
    tmp = tempfile.NamedTemporaryFile(delete=False)
    tmp.write(await file.read())
    tmp.close()

    # Upload file → store
    upload_op = client.file_search_stores.upload_to_file_search_store(
        file_search_store_name=store_name,
        file=tmp.name
    )

    # Wait for processing completion
    while not upload_op.done:
        time.sleep(2)
        upload_op = client.operations.get(upload_op.name)

    os.unlink(tmp.name)

    return {"store_id": store_name}


# -----------------------------
# 2. CHAT ROUTE
# -----------------------------
@app.post("/chat")
async def chat(store_id: str = Form(...), prompt: str = Form(...)):

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

    grounding = response.candidates[0].grounding_metadata
    if grounding:
        sources = list({c.retrieved_context.title for c in grounding.grounding_chunks})
    else:
        sources = []

    return {"answer": answer, "sources": sources}
