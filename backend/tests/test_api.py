import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as c:
        yield c


@pytest.fixture
async def auth_client(client):
    """Returns a client with a valid auth token."""
    res = await client.post("/api/v1/auth/register", json={
        "email": "testuser@example.com", "password": "testpass123"
    })
    token = res.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    yield client


# === Health ===

@pytest.mark.asyncio
async def test_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


# === Auth ===

@pytest.mark.asyncio
async def test_register_success(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "new@example.com", "password": "pass123456"
    })
    assert res.status_code == 201
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com", "password": "pass123456"
    })
    res = await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com", "password": "pass123456"
    })
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login@example.com", "password": "pass123456"
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com", "password": "pass123456"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrong@example.com", "password": "pass123456"
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com", "password": "wrongpass"
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    res = await client.post("/api/v1/auth/login", json={
        "email": "ghost@example.com", "password": "pass123456"
    })
    assert res.status_code == 401


# === Protected Endpoints ===

@pytest.mark.asyncio
async def test_documents_requires_auth(client):
    res = await client.get("/api/v1/documents")
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_search_requires_auth(client):
    res = await client.get("/api/v1/search?q=test")
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_ask_requires_auth(client):
    res = await client.post("/api/v1/ai/ask", json={"question": "test"})
    assert res.status_code == 403


# === Documents ===

@pytest.mark.asyncio
async def test_list_documents_empty(auth_client):
    res = await auth_client.get("/api/v1/documents")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["documents"] == []


@pytest.mark.asyncio
async def test_upload_invalid_type(auth_client):
    res = await auth_client.post("/api/v1/documents", files={
        "file": ("test.txt", b"hello", "text/plain")
    })
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_document_not_found(auth_client):
    res = await auth_client.get("/api/v1/documents/00000000-0000-0000-0000-000000000099")
    assert res.status_code == 404


# === Categories ===

@pytest.mark.asyncio
async def test_create_and_list_categories(auth_client):
    res = await auth_client.post("/api/v1/categories", json={"name": "Appliances"})
    assert res.status_code == 201
    assert res.json()["name"] == "Appliances"

    res = await auth_client.get("/api/v1/categories")
    assert res.status_code == 200
    assert len(res.json()) >= 1


# === Input Validation ===

@pytest.mark.asyncio
async def test_register_invalid_email(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "not-an-email", "password": "pass123456"
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_search_empty_query(auth_client):
    res = await auth_client.get("/api/v1/search?q=")
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_ask_empty_question(auth_client):
    res = await auth_client.post("/api/v1/ai/ask", json={"question": ""})
    # Pydantic should accept empty string but question field exists
    assert res.status_code in (200, 422)
