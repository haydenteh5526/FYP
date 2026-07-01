"""Unit tests for the background task queue — fallback behaviour."""
import pytest

from app.services import task_queue


@pytest.mark.asyncio
async def test_enqueue_returns_false_without_redis(monkeypatch):
    # No REDIS_URL configured -> caller should process inline
    monkeypatch.setattr(task_queue.settings, "REDIS_URL", "")
    assert await task_queue.enqueue_document_processing("some-id") is False


@pytest.mark.asyncio
async def test_enqueue_returns_false_on_connection_error(monkeypatch):
    # REDIS_URL set but unreachable -> graceful fallback (False), no exception
    monkeypatch.setattr(task_queue.settings, "REDIS_URL", "redis://127.0.0.1:6390/0")
    result = await task_queue.enqueue_document_processing("some-id")
    assert result is False
