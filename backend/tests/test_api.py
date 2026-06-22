"""
Tests designed to run in CI with a fresh database.
When running locally, use: docker compose exec api pytest tests/ -v

Note: Tests that require auth register their own user inline
to avoid fixture connection pool conflicts with the running app.
"""
import time

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"


async def _get_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url=BASE)


async def _register_and_get_token(client: AsyncClient) -> str:
    email = f"test-{time.time_ns()}@example.com"
    res = await client.post("/api/v1/auth/register", json={"email": email, "password": "testpass123"})
    return res.json()["access_token"]


# === Health ===

@pytest.mark.asyncio
async def test_health():
    async with await _get_client() as client:
        res = await client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


# === Auth ===

@pytest.mark.asyncio
async def test_register_success():
    async with await _get_client() as client:
        res = await client.post("/api/v1/auth/register", json={
            "email": f"reg-{time.time_ns()}@example.com", "password": "pass123456"
        })
    assert res.status_code == 201
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_register_invalid_email():
    async with await _get_client() as client:
        res = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email", "password": "pass123456"
        })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with await _get_client() as client:
        email = f"login-{time.time_ns()}@example.com"
        await client.post("/api/v1/auth/register", json={"email": email, "password": "pass123456"})
        res = await client.post("/api/v1/auth/login", json={"email": email, "password": "wrongpass"})
    assert res.status_code == 401


# === Protected Endpoints ===

@pytest.mark.asyncio
async def test_documents_requires_auth():
    async with await _get_client() as client:
        res = await client.get("/api/v1/documents")
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_search_requires_auth():
    async with await _get_client() as client:
        res = await client.get("/api/v1/search?q=test")
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_ask_requires_auth():
    async with await _get_client() as client:
        res = await client.post("/api/v1/ai/ask", json={"question": "test"})
    assert res.status_code == 403


# === Authenticated Endpoints ===

@pytest.mark.asyncio
async def test_list_documents_empty():
    async with await _get_client() as client:
        token = await _register_and_get_token(client)
        res = await client.get("/api/v1/documents", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["total"] == 0


@pytest.mark.asyncio
async def test_upload_invalid_type():
    async with await _get_client() as client:
        token = await _register_and_get_token(client)
        res = await client.post("/api/v1/documents",
                                headers={"Authorization": f"Bearer {token}"},
                                files={"file": ("test.txt", b"hello", "text/plain")})
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_document_not_found():
    async with await _get_client() as client:
        token = await _register_and_get_token(client)
        res = await client.get("/api/v1/documents/00000000-0000-0000-0000-000000000099",
                               headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_create_category():
    async with await _get_client() as client:
        token = await _register_and_get_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        res = await client.post("/api/v1/categories", json={"name": "Appliances"}, headers=headers)
    assert res.status_code == 201
    assert res.json()["name"] == "Appliances"
