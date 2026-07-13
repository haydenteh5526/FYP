import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user_id, get_db
from app.services import embedding_service

router = APIRouter()


class ChatTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class AskRequest(BaseModel):
    question: str
    document_id: str | None = None
    history: list[ChatTurn] = []


class Source(BaseModel):
    document_id: str
    document_title: str
    chunk_text: str
    similarity: float


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]


@router.get("/status")
async def ai_status():
    """Report AI provider availability for the Settings page."""
    status = {
        "groq": bool(settings.GROQ_API_KEY),
        "gemini": bool(settings.GEMINI_API_KEY),
        "ollama": bool(settings.OLLAMA_URL),
        "ocr_backend": settings.OCR_BACKEND,
        "mode": (
            "groq" if settings.GROQ_API_KEY
            else "gemini" if settings.GEMINI_API_KEY
            else "ollama" if settings.OLLAMA_URL
            else "dev-fallback"
        ),
    }
    return status


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

    # 4. Generate answer via LLM (with conversation history)
    answer = _generate_answer(req.question, context, req.history)

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


def _generate_answer(question: str, context: str, history: list[ChatTurn] | None = None) -> str:
    if settings.GROQ_API_KEY:
        return _generate_answer_groq(question, context, history)
    if settings.GEMINI_API_KEY:
        return _generate_answer_gemini(question, context, history)
    return f"[Dev mode - no AI key] Based on your documents, here are relevant excerpts:\n\n{context[:500]}"


def _generate_answer_groq(question: str, context: str, history: list[ChatTurn] | None = None) -> str:
    from openai import OpenAI

    from app.services.retry import with_retry

    client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")

    messages: list[dict] = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant that answers questions based on the user's stored documents. "
                "Only answer using information from the provided context. "
                "If the answer is not in the context, say 'I don't have information about that in your documents.' "
                "Cite which document the answer comes from."
            ),
        }
    ]
    if history:
        for turn in history[-6:]:
            if turn.role in ("user", "assistant"):
                messages.append({"role": turn.role, "content": turn.content})
    messages.append({
        "role": "user",
        "content": f"Context from my documents:\n\n{context}\n\n---\n\nQuestion: {question}",
    })

    response = with_retry(lambda: client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=500,
    ), label="groq.chat")

    return response.choices[0].message.content


def _generate_answer_gemini(question: str, context: str, history: list[ChatTurn] | None = None) -> str:
    from google import genai

    from app.services.retry import with_retry

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    system_instruction = (
        "You are a helpful assistant that answers questions based on the user's stored documents. "
        "Only answer using information from the provided context. "
        "If the answer is not in the context, say 'I don't have information about that in your documents.' "
        "Cite which document the answer comes from."
    )

    # Build conversation contents
    contents: list[dict] = []
    if history:
        for turn in history[-6:]:
            if turn.role == "user":
                contents.append({"role": "user", "parts": [{"text": turn.content}]})
            elif turn.role == "assistant":
                contents.append({"role": "model", "parts": [{"text": turn.content}]})

    contents.append({
        "role": "user",
        "parts": [{"text": f"Context from my documents:\n\n{context}\n\n---\n\nQuestion: {question}"}],
    })

    response = with_retry(lambda: client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config={
            "system_instruction": system_instruction,
            "temperature": 0.3,
            "max_output_tokens": 500,
        },
    ), label="gemini.chat")

    return response.text


def _generate_answer_openai(question: str, context: str, history: list[ChatTurn] | None = None) -> str:
    from openai import OpenAI

    from app.services.retry import with_retry
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    messages: list[dict] = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant that answers questions based on the user's stored documents. "
                "Only answer using information from the provided context. "
                "If the answer is not in the context, say 'I don't have information about that in your documents.' "
                "Cite which document the answer comes from."
            ),
        }
    ]
    # Include up to the last 6 turns for follow-up context
    if history:
        for turn in history[-6:]:
            if turn.role in ("user", "assistant"):
                messages.append({"role": turn.role, "content": turn.content})
    messages.append({
        "role": "user",
        "content": f"Context from my documents:\n\n{context}\n\n---\n\nQuestion: {question}",
    })

    response = with_retry(lambda: client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
        max_tokens=500,
    ), label="openai.chat")

    return response.choices[0].message.content
