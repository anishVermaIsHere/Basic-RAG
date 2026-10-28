import uuid
import logging

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Document, DocChunk
from app.services.doc_upload_service import DocUploadService

logger = logging.getLogger(__name__)


class DocumentService:
   async def get(self, db: AsyncSession):
      # one query: each document plus how many chunks it has
      stmt = (
         select(Document, func.count(DocChunk.id).label("chunk_count"))
         .outerjoin(DocChunk, DocChunk.document_id == Document.id)
         .group_by(Document.id)
         .order_by(Document.created_at.desc())
      )
      result = await db.execute(stmt)

      return [
         {
            "id": str(document.id),
            "filename": document.filename,
            "content_type": document.content_type,
            "file_size": document.file_size,
            "url": document.storage_path,
            "status": document.status,
            "chunks": chunk_count,
            "created_at": document.created_at,
         }
         for document, chunk_count in result.all()
      ]

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

   async def create_from_upload(self, db: AsyncSession, filename: str, content_type: str, file_size: int, storage_path: str):
      document = Document(
         filename=filename,
         file_size=file_size,
         content_type=content_type,
         storage_path=storage_path,
         status="pending"
      )
      db.add(document)
      await db.commit()
      await db.refresh(document)

      return document

   async def rename(self, db: AsyncSession, document_id: uuid.UUID, filename: str):
      filename = (filename or "").strip()
      if not filename:
         raise HTTPException(status_code=400, detail="filename is required")
      if len(filename) > 255:
         raise HTTPException(status_code=400, detail="filename is too long")

      document = await db.get(Document, document_id)
      if not document:
         raise HTTPException(status_code=404, detail="document not found")

      document.filename = filename
      await db.commit()
      await db.refresh(document)

      return document

   async def delete(self, db: AsyncSession, document_id: uuid.UUID) -> None:
      """Deletes the document (chunks cascade), then removes the file from Cloudinary."""
      document = await db.get(Document, document_id)
      if not document:
         raise HTTPException(status_code=404, detail="document not found")

      storage_path = document.storage_path
      await db.delete(document)
      await db.commit()

      # the row is already gone, so a storage failure must not fail the request; it only leaves an orphaned file
      public_id = DocUploadService.public_id_from_url(storage_path)
      if not public_id:
         logger.warning("Could not derive Cloudinary public_id from %s", storage_path)
         return

      try:
         await DocUploadService().delete(public_id)
      except Exception:
         logger.exception("Failed to delete %s from Cloudinary", public_id)

   async def set_status(self, db: AsyncSession, document_id: uuid.UUID, status: str):
      document = await db.get(Document, document_id)
      if not document:
         raise HTTPException(status_code=404, detail="document not found")

      document.status = status
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