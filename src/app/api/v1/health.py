from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.health_service import HealthService


router = APIRouter()


@router.get("/health")
async def health_check(
    db: AsyncSession = Depends(get_db),
):
    return await HealthService.check_app(db)