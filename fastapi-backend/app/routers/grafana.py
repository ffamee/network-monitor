from typing import Any

from fastapi import APIRouter, Body

router = APIRouter(
	prefix="/grafana",
	tags=["grafana"],
)


@router.post("/webhook")
async def grafana_webhook(payload: dict[str, Any] = Body(...)):
	print("Received Grafana Webhook Payload:", payload)
