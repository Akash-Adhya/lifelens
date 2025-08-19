from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

@app.post("/upload")
async def upload_files(
    message: str = Form(...),  # Text message from frontend
    files: Optional[List[UploadFile]] = File(None)  # Files (optional)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure folder exists

    saved_files = []
    if files:
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append({"filename": file.filename, "path": file_path})

    return {
        "message": message,
        "files": saved_files
    }


