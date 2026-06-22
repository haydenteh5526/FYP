from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import ai, auth, categories, documents, search, warranties


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.storage_service import ensure_bucket_exists
    ensure_bucket_exists()
    yield


app = FastAPI(
    title="AI Cloud Document Vault",
    version="0.1.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(warranties.router, prefix="/api/v1/warranties", tags=["warranties"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])


@app.get("/health")
async def health():
    return {"status": "ok"}
