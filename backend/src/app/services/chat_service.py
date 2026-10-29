import uuid

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.db.models.chat import Chat
from app.db.models.message import MessageRole
from app.schemas.chat import MessagePayload, ChatUpdate
from app.services.assistant_service import AssistantService
from app.services.message_service import MessageService
from app.services.llm_service import LLMService
from starlette.concurrency import iterate_in_threadpool
from app.llm.llm_openai import OpenAIProvider
from app.utils.chat import generate_chat_title, convert_messages


class ChatService:
    async def stream_message(self, user_id: uuid.UUID, chat_id: uuid.UUID, db: AsyncSession, payload: MessagePayload):
        message_service = MessageService()

        # Save user message
        await message_service.create(
            db=db,
            chat_id=chat_id,
            sender=payload.sender.model_dump(mode="json"),
            content=payload.content,
            role=MessageRole.USER.value
        )

        await db.commit()

        # Stream AI
        open_ai_provider = OpenAIProvider()
        ai_service = LLMService(open_ai_provider)
        assistant_service = AssistantService()

        answer = ""

        messages = [
            {
                "role": "user",
                "content": payload.content
            }
        ]

        # provider stream is a blocking sync generator; keep it off the event loop
        async for chunk in iterate_in_threadpool(ai_service.stream(messages)):
            answer += chunk

            yield chunk

        # Save complete assistant response
        assistant = await assistant_service.get_by_name(db, "Look AI")

        assistant_sender = {
            "id": str(assistant.id),
            "location": None
        }

        await message_service.create(
            db=db,
            chat_id=chat_id,
            sender=assistant_sender,
            content=answer,
            role=MessageRole.ASSISTANT.value
        )

        await db.commit()


    async def get_or_create_chat(self, user_id: uuid.UUID, db: AsyncSession, payload: MessagePayload) -> Chat:
        if payload.chat_id:
            chat = await self.get_by_id(payload.chat_id, db)
            if not chat:
                raise HTTPException(status_code=404, detail="Chat not found")
            return chat
        
        chat_title = generate_chat_title(payload.content)
        chat = await self.create(user_id, db, chat_title)
        await db.flush()

        return chat

    async def create(self, user_id: uuid.UUID, db: AsyncSession, chat_title: str) -> Chat:
        chat = Chat(title=chat_title, user_id=user_id)
        db.add(chat)
        await db.flush()

        return chat

    async def get_by_id(self, chat_id: uuid.UUID, db: AsyncSession, is_messages: bool = False) -> Chat | None:
        if isinstance(chat_id, str):
            try:
                chat_id = uuid.UUID(chat_id)
            except ValueError:
                return None
        query = select(Chat).where(Chat.id == chat_id)
        if is_messages:
            query = query.options(selectinload(Chat.messages))
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_user_id(self, user_id: uuid.UUID, db: AsyncSession):
        result = await db.execute(
            select(Chat).where(Chat.user_id == user_id).order_by(Chat.created_at.desc())
        )
        return result.scalars().all()

    async def delete_by_id(self, chat_id: uuid.UUID, db: AsyncSession):
        delete_chat = await self.get_by_id(chat_id, db)

        if delete_chat is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chat with id {chat_id} not found")
        await db.delete(delete_chat)
        await db.commit()

        return { "success": True }

    async def update_by_id(self, chat_id: uuid.UUID, payload: ChatUpdate, db: AsyncSession):
        chat_item = await self.get_by_id(chat_id, db)

        if chat_item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chat with id {chat_id} not found")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(chat_item, key, value)
        await db.commit()
        await db.refresh(chat_item)

        return { "success": True, "chat": chat_item }

    async def search(self, q: str | None, user_id: uuid.UUID, db: AsyncSession):
        query = (
            select(Chat)
            .where(
                Chat.user_id == user_id,
                Chat.title.ilike(f"%{q}%")
            )
            .order_by(Chat.created_at.desc())
        )

        result = await db.execute(query)

        return result.scalars().all()
