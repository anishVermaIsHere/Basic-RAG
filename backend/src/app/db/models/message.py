import uuid
import enum 

from sqlalchemy import Column, String, TIMESTAMP, Enum, text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.database import Base


# Use Python Enum for strict type safety
class MessageRole(str, enum.Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sender = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    content = Column(String, nullable=False)
    role = Column(Enum(MessageRole, values_callable=lambda enum_cls: [member.value for member in enum_cls]), nullable=False, default=MessageRole.USER.value)
    chat = relationship("Chat", back_populates="messages")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))