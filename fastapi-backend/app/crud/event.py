from datetime import UTC, datetime

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.event import Event
from app.models.probe import Probe


async def count_building_event_today(session: AsyncSession, building_id: int) -> int:
	statement = (
		select(func.count(Event.id))
		.join(Event.probe)
		.where(
			Probe.building_id == building_id,
			Event.started_at
			>= datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0),
		)
	)
	result = await session.execute(statement)
	count = result.scalar_one()
	return count
