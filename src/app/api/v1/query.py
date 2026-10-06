
from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.query import QueryPayload
from app.db.database import get_db
from app.pipeline import retrieve_chunks, context_build


router = APIRouter(prefix="/search", tags=["Query"])


@router.post("", summary="Search Query", description="Accepts user query and return relevant response.")
async def search_query(req: Request, payload: QueryPayload, db: AsyncSession = Depends(get_db)):
    query = payload.content
    chunks = await retrieve_chunks(db, query)

    data = [
        {
            "chunk_id": str(chunk.id),
            "document_id": str(chunk.document_id),
            "content": chunk.content,
            "chunk_index": chunk.chunk_index,
        }
        for chunk in chunks
    ] 

    doc = context_build(data)

    return { 
        "data": doc
    }
