import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user_id
from app.models.base import DocChunk, Document
from app.services import embedding_service

router = APIRouter()


@router.get("")
async def search_documents(
    q: str = Query(..., min_length=1),
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    # Generate embedding for query
    query_embedding = embedding_service.get_embedding(q)

    # Vector similarity search using pgvector cosine distance
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
    result = await db.execute(
        text("""
            SELECT dc.id, dc.chunk_text, dc.document_id, dc.chunk_index,
                   d.title as document_title,
                   1 - (dc.embedding <=> cast(:embedding as vector)) as similarity
            FROM doc_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE d.user_id = cast(:user_id as uuid)
            ORDER BY dc.embedding <=> cast(:embedding as vector)
            LIMIT :limit
        """),
        {
            "embedding": embedding_str,
            "user_id": str(user_id),
            "limit": limit,
        },
    )

    rows = result.fetchall()
    return {
        "query": q,
        "results": [
            {
                "chunk_text": row.chunk_text,
                "document_id": row.document_id,
                "document_title": row.document_title,
                "similarity": round(row.similarity, 4) if row.similarity == row.similarity else 0.0,
            }
            for row in rows
        ],
    }
