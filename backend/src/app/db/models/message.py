import datetime
import enum
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Index, Table, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.db.models.chat import Chat
    from app.db.models.document_chunk import DocChunk


# Use Python Enum for strict type safety
class MessageRole(str, enum.Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


# Many-to-many: which document chunks were retrieved/cited for a message (RAG sources)
message_sources = Table(
    "message_sources",
    Base.metadata,
    Column("message_id", UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True),
    Column("chunk_id", UUID(as_uuid=True), ForeignKey("document_chunks.id", ondelete="CASCADE"), primary_key=True),
)


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        # Fetching a chat's history in order is the hot query
        Index("ix_messages_chat_id_created_at", "chat_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False
    )
    sender: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[MessageRole] = mapped_column(
        Enum(
            MessageRole,
            name="message_role",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=MessageRole.USER,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")
    sources: Mapped[list["DocChunk"]] = relationship("DocChunk", secondary=message_sources, lazy="selectin")
