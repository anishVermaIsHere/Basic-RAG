from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Any

from app.schemas.message import Sender
from app.database.models.message import MessageRole


class MessagePayload(BaseModel):
    chat_id: str | None = None
    content: str
    sender: Sender

    # messages: list[dict[str, Any]]


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sender: Sender
    content: str
    role: MessageRole
    created_at: datetime

class ChatResponse(BaseModel):
    chat_id: str
    messages: list[MessageResponse]
    
class ChatUpdate(BaseModel):
    title: str
