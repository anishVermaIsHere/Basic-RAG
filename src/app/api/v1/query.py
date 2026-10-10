
from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.query import QueryPayload
from app.db.database import get_db
from app.pipeline import hybrid_retrieve, context_build, Generator

router = APIRouter(prefix="/search", tags=["Query"])


@router.post("", summary="Search Query", description="Accepts user query and return relevant response.")
async def search_query(req: Request, payload: QueryPayload, db: AsyncSession = Depends(get_db)):
    query = payload.content
    chunks = await hybrid_retrieve(db, query)

    data = [
        {
            "chunk_id": str(chunk.id),
            "document_id": str(chunk.document_id),
            "content": chunk.content,
            "chunk_index": chunk.chunk_index,
        }
        for chunk in chunks
    ] 

    context = context_build(data)

    generator = Generator()

    answer = await generator.generate(
        question=query,
        context=context,
    )

    return {
        "answer": answer,
    }
