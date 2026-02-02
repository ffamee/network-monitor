from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.building import Building
from app.models.event import Event
from app.models.probe import Probe


async def set_event(
	session: AsyncSession,
	zone_id: int,
	building_id: int,
	probe_id: int,
	name: str,
	severity: str,
	fingerprint: str,
	description: str | None = None,
	silence_url: str | None = None,
	started_at: str | None = None,
	resolved_at: str | None = None,
	status: str = "firing",
) -> None:
	started_at_dt = (
		datetime.fromisoformat(started_at.replace("Z", "+00:00"))
		if started_at
		else None
	)
	resolved_at_dt = (
		datetime.fromisoformat(resolved_at.replace("Z", "+00:00"))
		if resolved_at
		else None
	)
	# check probe existence is skipped for brevity
	statement = (
		select(Probe)
		.join(Probe.building)
		.where(Probe.id == probe_id)
		.where(Probe.building_id == building_id)
		.where(Building.zone_id == zone_id)
	)
	result = await session.execute(statement)
	probe = result.scalars().one_or_none()
	if not probe:
		return

	if status not in ["firing", "resolved"]:
		return

	if status == "firing":
		stmt_event = (
			select(Event)
			.where(Event.fingerprint == fingerprint)
			.where(Event.status == "firing")
		)
		event_result = await session.execute(stmt_event)
		event = event_result.scalars().one_or_none()
		if event:
			return
		new_event = Event(
			name=name,
			severity=severity,
			description=description,
			status=status,
			fingerprint=fingerprint,
			silence_url=silence_url,
			started_at=started_at_dt,
			probe_id=probe.id,
		)
		session.add(new_event)
	else:
		# Resolve existing event
		statement = (
			select(Event)
			.where(Event.fingerprint == fingerprint)
			.where(Event.status == "firing")
			.join(Event.probe)
			.join(Probe.building)
			.where(Probe.id == probe_id)
			.where(Probe.building_id == building_id)
			.where(Building.zone_id == zone_id)
		)
		result = await session.execute(statement)
		event = result.scalars().one_or_none()
		if event:
			event.status = "resolved"
			event.resolved_at = resolved_at_dt
			session.add(event)
	await session.commit()
