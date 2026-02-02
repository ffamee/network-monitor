from typing import Any

from fastapi import APIRouter, Body

from app.crud import grafana as crud_grafana
from app.dependencies import SessionDep

router = APIRouter(
	prefix="/grafana",
	tags=["grafana"],
)


@router.post("/webhook")
async def grafana_webhook(session: SessionDep, payload: dict[str, Any] = Body(...)):
	"""Receive webhook alerts from Grafana.

	Args:
		payload (dict[str, Any], optional): _description_. Defaults to Body(...).
	"""
	alerts = payload.get("alerts", [])
	for alert in alerts:
		status = alert.get("status")
		labels = alert.get("labels", {})
		name = labels.get("rulename")
		building_id = labels.get("building_id")
		zone_id = labels.get("zone_id")
		probe_id = labels.get("probe_id")
		severity = labels.get("severity", "warning")
		description = alert.get("annotations", {}).get("summary")
		fingerprint = alert.get("fingerprint")
		silence_url = alert.get("silenceURL")
		starts_at = alert.get("startsAt")
		ends_at = alert.get("endsAt")
		await crud_grafana.set_event(
			session=session,
			zone_id=int(zone_id),
			building_id=int(building_id),
			probe_id=int(probe_id),
			name=name,
			severity=severity,
			fingerprint=fingerprint,
			description=description,
			silence_url=silence_url,
			started_at=starts_at,
			resolved_at=ends_at,
			status=status,
		)
	return {"message": "Grafana webhook received"}
