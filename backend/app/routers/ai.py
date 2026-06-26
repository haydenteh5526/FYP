import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user_id, get_db
from app.services import embedding_service

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    document_id: str | None = None


class Source(BaseModel):
    document_id: str
    document_title: str
    chunk_text: str
    similarity: float


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]


@router.post("/ask", response_model=AskResponse)
async def ask_question(req: AskRequest, db: AsyncSession = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    # 1. Embed the question
    query_embedding = embedding_service.get_embedding(req.question)
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # 2. Retrieve top-5 relevant chunks (optionally scoped to one document)
    params = {"embedding": embedding_str, "user_id": str(user_id)}
    doc_filter = ""
    if req.document_id:
        doc_filter = "AND dc.document_id = cast(:document_id as uuid)"
        params["document_id"] = req.document_id

    result = await db.execute(
        text(f"""
            SELECT dc.chunk_text, dc.document_id, d.title as document_title,
                   1 - (dc.embedding <=> cast(:embedding as vector)) as similarity
            FROM doc_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE d.user_id = cast(:user_id as uuid)
            {doc_filter}
            ORDER BY dc.embedding <=> cast(:embedding as vector)
            LIMIT 5
        """),
        params,
    )
    rows = result.fetchall()

    if not rows:
        return AskResponse(answer="I don't have any documents to answer from.", sources=[])

    # 3. Build context from retrieved chunks
    context = "\n\n---\n\n".join(
        f"[From: {row.document_title}]\n{row.chunk_text}" for row in rows
    )

    # 4. Generate answer via LLM
    answer = _generate_answer(req.question, context)

    # 5. Return answer + sources
    sources = [
        Source(
            document_id=str(row.document_id),
            document_title=row.document_title,
            chunk_text=row.chunk_text[:200],
            similarity=round(row.similarity, 4) if row.similarity == row.similarity else 0.0,
        )
        for row in rows
    ]

    return AskResponse(answer=answer, sources=sources)


def _generate_answer(question: str, context: str) -> str:
    if not settings.OPENAI_API_KEY:
        return f"[Dev mode - no OpenAI key] Based on your documents, here are relevant excerpts:\n\n{context[:500]}"

    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that answers questions based on the user's stored documents. "
                    "Only answer using information from the provided context. "
                    "If the answer is not in the context, say 'I don't have information about that in your documents.' "
                    "Cite which document the answer comes from."
                ),
            },
            {
                "role": "user",
                "content": f"Context from my documents:\n\n{context}\n\n---\n\nQuestion: {question}",
            },
        ],
        temperature=0.3,
        max_tokens=500,
    )

    return response.choices[0].message.content
