from fastapi import HTTPException
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.services import DocumentService, EmbeddingService
from app.pipeline import load_document, chunk_text




async def ingest_document(session: AsyncSession, file_path: str):
    if not session:
        raise ValueError("session not found")
    
    if not file_path:
        raise ValueError("file_path is not found")

    doc_texts = load_document(file_path)

    all_chunks = []
    for element in doc_texts:
        text_chunks = chunk_text(element["text"])
        for chunk in text_chunks:
            all_chunks.append({
                "content": chunk,
                "page": element.get("page"),
                "source": element["source"]
            })

    chunk_texts = [c["content"] for c in all_chunks]
    embedding_model = EmbeddingService()
    embeddings = embedding_model.embed_many(chunk_texts)

    if len(chunk_texts) != len(embeddings):
        raise ValueError("Chunks and embeddings count mismatch")

    document_service = DocumentService()
    file = Path(file_path)
    doc = await document_service.create(session, file.stem, file)

    if not doc:
        raise HTTPException(status_code=404, detail="DB not found")

    for index, (content, embedding) in enumerate(
        zip(chunk_texts, embeddings)
    ):
       await document_service.create_chunk(session, doc.id, content, index, embedding)

    return len(chunk_texts)
    

