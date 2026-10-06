from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DocChunk
from app.pipeline import EmbeddingModel


async def retrieve_chunks(db: AsyncSession, query: str, top_k: int = 5):
    embedding_model = EmbeddingModel()
    query_embedding = embedding_model.embed(query)

    stmt = (select(DocChunk).order_by(DocChunk.embedding.cosine_distance(query_embedding)).limit(top_k))
    result = await db.execute(stmt)

    return result.scalars().all()
