from typing import Any

from fastapi import APIRouter, Body

router = APIRouter(
	prefix="/agent",
	tags=["agent"],
)


@router.post("/heartbeat")
async def agent_heartbeat(message: dict[str, Any] = Body(...)) -> None:
	print("Heartbeat received:", message)
