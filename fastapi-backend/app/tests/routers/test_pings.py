import pytest


@pytest.mark.anyio
async def test_ping(async_client):
    response = await async_client.get("/pings/")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}
