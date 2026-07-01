"""ARQ worker — runs heavy document processing off the request path.

Start with:  arq app.worker.WorkerSettings
"""
from arq.connections import RedisSettings

from app.config import settings
from app.logging_config import get_logger
from app.services.document_processor import process_document

logger = get_logger("worker")


async def process_document_task(ctx: dict, document_id: str) -> None:
    logger.info("Worker picked up document %s", document_id)
    await process_document(document_id)


class WorkerSettings:
    functions = [process_document_task]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL or "redis://redis:6379/0")
    max_jobs = 5
    job_timeout = 300  # seconds — large PDFs can take a while
