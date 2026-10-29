from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.assistant import Assistant


class AssistantService:

    @staticmethod
    async def get_by_name(db: AsyncSession, name: str) -> Assistant:
        result = await db.execute(select(Assistant).where(Assistant.name == name))
        assistant = result.scalars().first()

        if not assistant:
            raise HTTPException(status_code=404, detail="Assistant not found")

        return assistant
