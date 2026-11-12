from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.cache import get_redis
from app.utils.redis import Cache
from app.services.auth_service import AuthService


router = APIRouter(prefix='/users', tags=["User"])

@router.get("/self", status_code=200)
async def self(req: Request, db: AsyncSession = Depends(get_db), redis: Cache = Depends(get_redis)):
    auth_service = AuthService()
    return await auth_service.self(req, db, redis)