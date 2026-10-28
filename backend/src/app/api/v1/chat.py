import uuid

from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Annotated

from app.db.database import get_db
from app.schemas.chat import MessagePayload, ChatUpdate
from app.services.message_service import create

router = APIRouter(prefix="/chats", tags=["Chat"])


@router.get("")
def chat_get():
    return { "success": True }

@router.post("", response_class=JSONResponse, summary="Chat with AI", description="Accepts a user message and returns an AI-generated response.")
def chat_create(req: Request, payload: MessagePayload, db: Session = Depends(get_db)):
    data = create(payload, db, req)
    return data

# @router.delete("/{chat_id}", response_class=JSONResponse, summary="Chat delete", description="Accepts chat_id and pass it to controller")
# def chat_delete(chat_id: uuid.UUID, db: Session = Depends(get_db)):
#     return delete_chat(chat_id, db)


# @router.get("/search", response_class=JSONResponse, summary="Chat search", description="Accepts query string and pass it to chat controller to fetch chat based on query")
# def chat_query(req: Request, query: Annotated[str | None, Query(min_length=3, max_length=50, alias="q")] = None, db: Session = Depends(get_db)):
#     return search_chat(query, db, req)


# @router.get("/{chat_id}", response_class=JSONResponse, summary="Chat fetch", description="Accepts chat_id and pass it to controller to fetch chat")
# def chat_fetch(chat_id: uuid.UUID, db: Session = Depends(get_db)):
#     return get_chat(chat_id, db)

# @router.put("/{chat_id}", response_class=JSONResponse, summary="Chat update", description="Accepts chat_id and pass it to controller to update chat")
# def chat_update(chat_id: str, payload: ChatUpdate, req: Request = None, db: Session = Depends(get_db)):
#     return update_chat(chat_id, payload, db)