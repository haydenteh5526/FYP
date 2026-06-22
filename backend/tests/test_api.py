import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register
        res = await client.post("/api/v1/auth/register", json={
            "email": "ci@test.com",
            "password": "testpass123",
        })
        assert res.status_code == 201
        token = res.json()["access_token"]
        assert token

        # Login
        res = await client.post("/api/v1/auth/login", json={
            "email": "ci@test.com",
            "password": "testpass123",
        })
        assert res.status_code == 200
        assert res.json()["access_token"]

        # Protected endpoint without token
        res = await client.get("/api/v1/documents")
        assert res.status_code == 403

        # Protected endpoint with token
        res = await client.get("/api/v1/documents", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
