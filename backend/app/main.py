from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.config import settings
from app.logging_config import configure_logging, get_logger, new_request_id, request_id_var
from app.routers import ai, auth, categories, documents, search, warranties

configure_logging()
logger = get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.storage_service import ensure_bucket_exists
    try:
        ensure_bucket_exists()
        logger.info("Storage bucket ready")
    except Exception as e:  # noqa: BLE001
        logger.error("Failed to ensure bucket: %s", e)
    yield


app = FastAPI(
    title="AI Cloud Document Vault",
    version="0.1.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or new_request_id()
    request_id_var.set(rid)
    logger.info("%s %s", request.method, request.url.path)
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": {"code": "RATE_LIMITED", "message": "Too many requests."}})


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
    """Liveness probe — fast, no dependencies."""
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready():
    """Readiness probe — checks DB, S3, and AI provider connectivity."""
    from app.dependencies import async_session
    from app.services.storage_service import get_s3_client

    checks: dict[str, str] = {}
    healthy = True

    # Database
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:  # noqa: BLE001
        checks["database"] = f"error: {type(e).__name__}"
        healthy = False

    # S3 / MinIO
    try:
        get_s3_client().head_bucket(Bucket=settings.S3_BUCKET)
        checks["storage"] = "ok"
    except Exception as e:  # noqa: BLE001
        checks["storage"] = f"error: {type(e).__name__}"
        healthy = False

    # AI provider (config presence only — no network call)
    checks["ai"] = "openai" if settings.OPENAI_API_KEY else ("ollama" if settings.OLLAMA_URL else "dev-fallback")

    status_code = 200 if healthy else 503
    return JSONResponse(status_code=status_code, content={"status": "ready" if healthy else "degraded", "checks": checks})
