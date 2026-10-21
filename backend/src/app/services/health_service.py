from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class HealthService:

    @staticmethod
    async def check_database(db: AsyncSession) -> bool:
        try:
            await db.execute(text("SELECT 1"))
            return True
        except Exception:
            return False

    @staticmethod
    async def check_app(db: AsyncSession) -> dict:
        database_healthy = await HealthService.check_database(db)

        return {
            "status": "healthy" if database_healthy else "unhealthy",
            "database": "up" if database_healthy else "down",
        }