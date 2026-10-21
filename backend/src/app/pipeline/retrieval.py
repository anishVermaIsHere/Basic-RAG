from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DocChunk
from app.services import EmbeddingService


async def hybrid_retrieve(db, query: str, top_k: int = 5):
    vector_chunks = await vector_search(db, query)
    keyword_chunks = await keyword_search(db, query)

     # Deduplicate while preserving order.
    merged = {}
    for chunk in vector_chunks + keyword_chunks:
        merged[chunk.id] = chunk

    return list(merged.values())[:top_k]


# Dense retrieval 

async def vector_search(db: AsyncSession, query: str, top_k: int = 10):
    embedding_model = EmbeddingService()
    query_embedding = embedding_model.embed(query)

    # stmt = (select(DocChunk).order_by(DocChunk.embedding.cosine_distance(query_embedding)).limit(top_k))
    distance = DocChunk.embedding.cosine_distance(query_embedding)
    stmt = (
        select(DocChunk, distance.label("distance"))
        .order_by(distance)
        .limit(top_k)
    )
    result = await db.execute(stmt)

    return result.scalars().all()


# Parse retrieval

async def keyword_search(db: AsyncSession, query: str, top_k: int = 10):
    search_query = func.websearch_to_tsquery("english", query)

    rank = func.ts_rank_cd(
        func.to_tsvector("english", DocChunk.content),
        search_query,
    )

    stmt = (
        select(DocChunk)
        .where(
            func.to_tsvector("english", DocChunk.content)
            .op("@@")(search_query)
        )
        .order_by(rank.desc())
        .limit(top_k)
    )

    result = await db.execute(stmt)
    return result.scalars().all()