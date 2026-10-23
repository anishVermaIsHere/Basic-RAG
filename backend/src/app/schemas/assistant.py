from pydantic import BaseModel
from uuid import UUID
from typing import Literal

class Assistant(BaseModel):
    id: UUID
    name: str
    role: Literal["assistant"]