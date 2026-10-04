import uuid

from openai import OpenAI
from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import JSONResponse
from app.pipeline.loader import load_document
from app.pipeline.chunking import chunk_text
from app.pipeline.embedding import create_embedding
from app.core.config import settings


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
def upload_file():
    text = load_document("src/app/data/documents/sample-document.md")
    chunks = chunk_text(text)
    text_embedding = create_embedding(chunks[0])
    # text_embedding = send_message('Which model you are using right now?')
    print('embedding reponse', text_embedding)

    return { 
        "chunks": chunks[0],
        "text_embedding": text_embedding 
    }

