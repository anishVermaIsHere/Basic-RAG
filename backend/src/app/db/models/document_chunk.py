import datetime
import uuid

from typing import Any
from sqlalchemy import UUID, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.db.database import Base


class DocChunk(Base):
    __tablename__ = "document_chunks"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(384)) 
    metadata: Mapped[dict[str, Any] | None] = mapped_column(JSONB, name="metadata", default=None)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now(), nullable=False)
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")