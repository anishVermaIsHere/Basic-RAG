import uuid

from openai import OpenAI
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.pipeline.ingestion import ingest_document
from app.core.config import settings
from app.db.database import get_db
from app.db.models import Document, DocChunk

router = APIRouter(prefix="/upload", tags=["File/Documents"])


def send_message(text: str):
    client = OpenAI(base_url=settings.OPENROUTER_BASE_URL, api_key=settings.OPENROUTER_API_KEY)
    response = client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=[
            {
            "role": "user",
            "content": text
            }
        ]
    )

    return response.choices[0].message.content


@router.get("/", summary="Upload document", description="Accepts a file path and return file content.")
async def upload_file(db: AsyncSession = Depends(get_db)):

    chunks_count = await ingest_document(session=db, file_path="src/app/data/documents/sample-document.md")

    return {
        "message": "Document upload and ingested successfully",
        "chunks_count": chunks_count
    }

