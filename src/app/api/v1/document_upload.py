import uuid

from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import JSONResponse
from app.pipeline.loader import load_document
from app.pipeline.chunking import chunk_text


router = APIRouter(prefix="/upload", tags=["File/Documents"])

@router.get("/", summary="Upload document", description="Accepts a file path and return file content.")
def upload_file():
    text = load_document("src/app/data/documents/sample-document.md")
    chunks = chunk_text(text)
    return { 
        "chunks": chunks,
        "length": len(chunks) 
    }