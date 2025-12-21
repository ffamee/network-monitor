import pytest
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="function")
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://localhost:8000"
    ) as async_client:
        yield async_client


@pytest.fixture(scope="function")
def client():
    with TestClient(app) as client:
        yield client
