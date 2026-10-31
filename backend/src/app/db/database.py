from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)
async_session = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def init_db():
    """Initializes the database by enabling pgvector and creating tables."""
    # Automatically create tables and enable extension on startup
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)
        # create_all doesn't alter existing tables
        await conn.execute(text("ALTER TABLE message_sources ADD COLUMN IF NOT EXISTS score DOUBLE PRECISION;"))
        await conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_url TEXT;"))
        await conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) NOT NULL DEFAULT 'file';"))
        await conn.execute(text("ALTER TABLE documents ALTER COLUMN file_size TYPE BIGINT;"))
        await conn.execute(text("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS page_number INTEGER;"))
        await conn.execute(text("ALTER TABLE chats ADD COLUMN IF NOT EXISTS assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL;"))
    
async def close_db():
    """Cleans up database connection pools on shutdown."""
    await engine.dispose()

async def get_db():
    async with async_session() as session:
        yield session