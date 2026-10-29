import uuid

from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.chat import MessagePayload
from app.services.chat_service import ChatService
from app.services.message_service import MessageService


router = APIRouter(prefix="/chats", tags=["Chat"])

chat_service = ChatService()
message_service = MessageService()

def chat_to_dict(chat):
    return {"id": str(chat.id), "title": chat.title, "created_at": chat.created_at}

@router.get("", summary="List or search the current user's chats")
async def chat_list(req: Request, q: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    user_id = uuid.UUID(req.state.user["sub"])
    q = q.strip() if q else None
    if q:
        chats = await chat_service.search(q, user_id, db)
    else:
        chats = await chat_service.get_by_user_id(user_id, db)
    return JSONResponse(content=jsonable_encoder([chat_to_dict(c) for c in chats]))

@router.get("/{chat_id}", summary="Get a chat with its messages")
async def chat_detail(chat_id: uuid.UUID, req: Request, db: AsyncSession = Depends(get_db)):
    user_id = uuid.UUID(req.state.user["sub"])
    chat = await chat_service.get_by_id(chat_id, db, is_messages=True)
    if not chat or chat.user_id != user_id:
        raise HTTPException(status_code=404, detail="Chat not found")
    return JSONResponse(content=jsonable_encoder({
        **chat_to_dict(chat),
        "messages": [message_service.to_dict(m) for m in chat.messages],
    }))

@router.post("", summary="Chat with AI", description="Accepts a user message and streams an AI-generated response.")
async def chat_create(req: Request, payload: MessagePayload, db: AsyncSession = Depends(get_db)):
    try:
        is_new_chat = not payload.chat_id
        user_id = uuid.UUID(req.state.user["sub"])
        chat = await chat_service.get_or_create_chat(user_id, db, payload)
        chat_id = chat.id
        await db.commit()  # persist the chat so it exists before streaming starts
    except HTTPException:
        await db.rollback()
        raise
    except Exception as error:
        await db.rollback()
        print("LLM Error:", error)
        raise HTTPException(status_code=502, detail="LLM request failed")

    async def generate_message():
        try:
            async for chunk in chat_service.stream_message(user_id, chat_id, db, payload):
                yield chunk
        except Exception as stream_err:
            print("Mid-stream LLM Error:", stream_err)

            if is_new_chat:
                try:
                    await db.rollback()  # Discard current session state
                    await chat_service.delete_by_id(chat_id, db)
                except Exception as cleanup_err:
                    print("Failed to cleanup chat:", cleanup_err)

            raise

    response = StreamingResponse(generate_message(), media_type="text/event-stream")
    response.headers["x-chat-id"] = str(chat_id)
    response.headers["Access-Control-Expose-Headers"] = "x-chat-id"

    return response
