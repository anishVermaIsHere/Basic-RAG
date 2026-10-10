import uuid

from openai import OpenAI
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.pipeline import ingest_document
from app.core.config import settings
from app.db.database import get_db


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


@router.get("/", response_class=JSONResponse, summary="Upload document", description="Accepts a file path and return file content.")
async def upload_file(db: AsyncSession = Depends(get_db)):
    await ingest_document(session=db, file_path="src/app/data/documents/sample-document.md")
    return {
        "message": "Document upload and ingested successfully"
    }
