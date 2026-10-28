import os
import uuid
import tempfile

from pathlib import Path
from openai import OpenAI
from fastapi import APIRouter, Depends, File, Query, UploadFile
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.pipeline import ingest_document
from app.core.config import settings
from app.db.database import get_db
from app.services.doc_upload_service import DocUploadService
from app.services.document_service import DocumentService


router = APIRouter(prefix="/documents", tags=["File/Documents"])


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


@router.get("/", response_class=JSONResponse, status_code=200, summary="List of all documents")
async def get_documents(db: AsyncSession = Depends(get_db)):
    return jsonable_encoder(await DocumentService().get(db))

@router.post("/upload", response_class=JSONResponse, status_code=201, summary="Upload document", description="Accepts a file (pdf, docx, txt, md up to 10 MB), stores it in Cloudinary and saves a document record.")
async def upload_file(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    uploaded = await DocUploadService().upload(file)

    try:
        document = await DocumentService().create_from_upload(
            db=db,
            filename=uploaded["filename"],
            content_type=uploaded["content_type"],
            file_size=uploaded["file_size"],
            storage_path=uploaded["storage_path"],
        )
    except Exception:
        # don't leave an orphaned file in storage if the DB write fails
        await DocUploadService().delete(uploaded["public_id"])
        raise

    # the pipeline reads from a local path, so ingest from a temp copy of the uploaded bytes
    with tempfile.NamedTemporaryFile(suffix=Path(uploaded["filename"]).suffix, delete=False) as tmp:
        tmp.write(uploaded["content"])
        tmp_path = tmp.name

    try:
        await ingest_document(session=db, file_path=tmp_path, document_id=document.id)
        document = await DocumentService().set_status(db, document.id, "ready")
    except Exception:
        await DocumentService().set_status(db, document.id, "failed")
        raise
    finally:
        os.unlink(tmp_path)

    return {
        "message": "Document uploaded successfully",
        "document": {
            "id": str(document.id),
            "filename": document.filename,
            "content_type": document.content_type,
            "file_size": document.file_size,
            "url": document.storage_path,
            "status": document.status,
        },
    }


class RenamePayload(BaseModel):
    filename: str


@router.patch("/{document_id}", response_class=JSONResponse, summary="Rename document")
async def rename_document(document_id: uuid.UUID, payload: RenamePayload, db: AsyncSession = Depends(get_db)):
    document = await DocumentService().rename(db, document_id, payload.filename)
    return {"id": str(document.id), "filename": document.filename}


@router.delete("/{document_id}", response_class=JSONResponse, summary="Delete document")
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await DocumentService().delete(db, document_id)
    return {"message": "Document deleted successfully"}

