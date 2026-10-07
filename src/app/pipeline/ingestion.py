from fastapi import HTTPException
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.document_service import DocumentService
from app.pipeline import load_document, chunk_text, EmbeddingModel




async def ingest_document(session: AsyncSession, file_path: str):
    if not session:
        raise ValueError("session not found")
    
    if not file_path:
        raise ValueError("file_path is not found")

    text = load_document(file_path)
    chunks = chunk_text(text)

    embedding_model = EmbeddingModel()
    embeddings = embedding_model.embed_many(chunks)

    if len(chunks) != len(embeddings):
        raise ValueError("Chunks and embeddings count mismatch")

    document_service = DocumentService()
    doc = await document_service.create(session, "SampleDocument", Path(file_path))

    if not doc:
         raise HTTPException(status_code=404, detail="DB not found")

    for index, (content, embedding) in enumerate(
        zip(chunks, embeddings)
    ):
       await document_service.create_chunk(session, doc.id, content, index, embedding)

    return len(chunks)
    

