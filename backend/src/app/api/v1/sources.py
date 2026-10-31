import uuid

from fastapi import APIRouter, Request, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Chat, DocChunk, Document, Message
from app.db.models.message import message_sources


router = APIRouter(prefix="/sources", tags=["Sources"])

SNIPPET_LENGTH = 240


def _user_filter(req: Request):
    # only chunks cited in the current user's own chats
    return Chat.user_id == uuid.UUID(req.state.user["sub"])


@router.get("", summary="List chunks cited in answers")
async def list_sources(
    req: Request,
    q: str | None = Query(None, description="Search chunk text or document name"),
    document_id: uuid.UUID | None = None,
    chat_id: uuid.UUID | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(message_sources.c.score, DocChunk, Document, Message, Chat)
        .select_from(message_sources)
        .join(Message, Message.id == message_sources.c.message_id)
        .join(Chat, Chat.id == Message.chat_id)
        .join(DocChunk, DocChunk.id == message_sources.c.chunk_id)
        .join(Document, Document.id == DocChunk.document_id)
        .where(_user_filter(req))
    )
    if q and q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(DocChunk.content.ilike(like), Document.filename.ilike(like)))
    if document_id:
        stmt = stmt.where(Document.id == document_id)
    if chat_id:
        stmt = stmt.where(Chat.id == chat_id)

    stmt = stmt.order_by(Message.created_at.desc(), message_sources.c.score.desc().nullslast())
    stmt = stmt.limit(limit).offset(offset)

    rows = (await db.execute(stmt)).all()
    data = [
        {
            "id": f"{message.id}:{chunk.id}",
            "chunk_id": str(chunk.id),
            "title": doc.filename,
            "document_id": str(doc.id),
            "snippet": chunk.content[:SNIPPET_LENGTH],
            "content": chunk.content,
            "chunk_index": chunk.chunk_index,
            "page": chunk.page_number or (chunk.chunked_metadata or {}).get("page"),
            "score": score,
            "chat_id": str(chat.id),
            "chat_title": chat.title,
            "message_id": str(message.id),
            "created_at": message.created_at,
        }
        for score, chunk, doc, message, chat in rows
    ]
    return JSONResponse(content=jsonable_encoder(data))


@router.get("/stats", summary="Citation counts per document")
async def source_stats(req: Request, db: AsyncSession = Depends(get_db)):
    cited = (
        select(
            Document.id,
            Document.filename,
            func.count(message_sources.c.message_id).label("citations"),
        )
        .select_from(Document)
        .outerjoin(DocChunk, DocChunk.document_id == Document.id)
        .outerjoin(message_sources, message_sources.c.chunk_id == DocChunk.id)
        .outerjoin(Message, Message.id == message_sources.c.message_id)
        .outerjoin(Chat, Chat.id == Message.chat_id)
        .where(or_(Chat.id.is_(None), _user_filter(req)))
        .group_by(Document.id, Document.filename)
        .order_by(func.count(message_sources.c.message_id).desc(), Document.filename)
    )
    rows = (await db.execute(cited)).all()
    return JSONResponse(content=jsonable_encoder([
        {"document_id": str(r.id), "title": r.filename, "citations": r.citations}
        for r in rows
    ]))
