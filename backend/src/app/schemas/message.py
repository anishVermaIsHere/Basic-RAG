from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


# Message Schemas

class Location(BaseModel):
    latitude: float | None = None
    longitude: float | None = None

class Sender(BaseModel):
    id: UUID | str
    location: Location

class Message(BaseModel):
    id: UUID | str
    sender: Sender
    content: str
    created_at: datetime 
    