from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, documents, search, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.storage_service import ensure_bucket_exists
    ensure_bucket_exists()

    # Seed temp user for development
    from app.dependencies import async_session
    from app.models.base import User
    import uuid
    async with async_session() as session:
        from sqlalchemy import select
        temp_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        result = await session.execute(select(User).where(User.id == temp_id))
        if not result.scalar_one_or_none():
            session.add(User(id=temp_id, email="dev@example.com", display_name="Dev User"))
            await session.commit()

    yield


app = FastAPI(
    title="AI Cloud Document Vault",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])


@app.get("/health")
async def health():
    return {"status": "ok"}
