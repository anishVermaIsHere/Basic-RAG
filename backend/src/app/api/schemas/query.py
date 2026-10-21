from pydantic import BaseModel, ConfigDict

class QueryPayload(BaseModel):
    # chat_id: str | None = None
    content: str
    # sender: Sender
