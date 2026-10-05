import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Document, DocChunk


class DocumentService:
   async def create(self, db: AsyncSession, filename: str, file_path: str):
      if not filename:
         raise HTTPException(status_code=404, detail="filename not found")

      if not file_path:
         raise HTTPException(status_code=404, detail="file_path not found")

      document = Document(
         filename=filename,
         file_size=file_path.stat().st_size,
         content_type="text/markdown",
         storage_path=str(file_path),
         status="pending"
      )

      if not document:
         raise HTTPException(status_code=404, detail="Chat not found")
      
      db.add(document)
      await db.commit()
      await db.refresh(document)

      return document

   async def create_chunk(self, db: AsyncSession, document_id: uuid.UUID, content: str, chunk_index: int, embedding: list[float]):
      if not document_id:
         raise HTTPException(status_code=404, detail="document_id not found")

      doc_chunk = DocChunk(
         document_id=document_id,
         content=content,
         chunk_index=chunk_index,
         embedding=embedding,
      )
      db.add(doc_chunk)
      await db.commit()
      await db.refresh(doc_chunk)

      return doc_chunk