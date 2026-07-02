"""
Integration tests — authenticated happy paths.
These exercise real DB + S3 operations and run in CI (not inside docker compose).
Each test uses a single request to avoid asyncpg event-loop conflicts.
"""
import io
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"

# Shared credentials — register once, login per-test
_EMAIL = f"inttest-{uuid.uuid4().hex[:8]}@example.com"
_PASSWORD = "TestPass123!"


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


# --- Helpers ---

async def _register():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        await c.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
        # Force-verify the user directly in the DB (CI only, no email service)
        from sqlalchemy import select

        from app.dependencies import async_session
        from app.models.base import User
        async with async_session() as db:
            user = (await db.execute(select(User).where(User.email == _EMAIL))).scalar_one_or_none()
            if user:
                user.is_verified = True
                await db.commit()


async def _get_token() -> str:
    await _register()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})
        return res.json()["access_token"]


# --- Auth flow ---

@pytest.mark.asyncio
async def test_login_returns_token():
    token = await _get_token()
    assert token
    assert len(token) > 20


# --- Documents ---

@pytest.mark.asyncio
async def test_upload_document():
    token = await _get_token()
    # Create a minimal PNG (1x1 white pixel)
    png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
        b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
        b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.post(
            "/api/v1/documents",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("test.png", io.BytesIO(png), "image/png")},
            data={"title": "Integration Test Doc"},
        )
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "Integration Test Doc"
    assert body["processing_status"] in ("pending", "complete")
    assert body["id"]


@pytest.mark.asyncio
async def test_list_documents():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.get("/api/v1/documents", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert "documents" in body
    assert "total" in body
    assert isinstance(body["documents"], list)


# --- Tags ---

@pytest.mark.asyncio
async def test_create_and_list_tags():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        # Create
        create_res = await c.post(
            "/api/v1/tags",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"name": "Receipts", "color": "green"},
        )
        assert create_res.status_code == 201
        tag = create_res.json()
        assert tag["name"] == "Receipts"

        # List
        list_res = await c.get("/api/v1/tags", headers={"Authorization": f"Bearer {token}"})
        assert list_res.status_code == 200
        tags = list_res.json()
        assert any(t["name"] == "Receipts" for t in tags)


# --- Categories ---

@pytest.mark.asyncio
async def test_create_category():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.post(
            "/api/v1/categories",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"name": "Manuals"},
        )
    assert res.status_code == 201
    assert res.json()["name"] == "Manuals"


# --- Warranties ---

@pytest.mark.asyncio
async def test_warranties_returns_list():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.get("/api/v1/warranties", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# --- AI status ---

@pytest.mark.asyncio
async def test_ai_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.get("/api/v1/ai/status")
    assert res.status_code == 200
    body = res.json()
    assert "mode" in body
    assert "ocr_backend" in body


# --- Search (requires auth, returns empty for new user) ---

@pytest.mark.asyncio
async def test_search_returns_results():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.get("/api/v1/search?q=test", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# --- Notifications ---

@pytest.mark.asyncio
async def test_register_push_token():
    token = await _get_token()
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.post(
            "/api/v1/notifications/register",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"token": "ExponentPushToken[ci-test-123]", "platform": "ios"},
        )
    assert res.status_code == 201
    assert res.json()["status"] in ("registered", "updated")


# --- Metrics ---

@pytest.mark.asyncio
async def test_metrics_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        res = await c.get("/metrics")
    assert res.status_code == 200
    assert "docvault_requests_total" in res.text
