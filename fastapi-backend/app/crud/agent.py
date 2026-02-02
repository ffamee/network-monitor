from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.building import Building
from app.models.probe import Probe


async def set_startup(
	session: AsyncSession,
	zone_id: int,
	building_id: int,
	probe_id: int,
	ip: str,
	mac_address: str,
	serial_number: str,
) -> dict[str, str]:
	"""Endpoint for agents to report their startup status."""
	if not ip or not mac_address or not serial_number:
		return {"message": "Invalid startup data"}

	# Check Existence of Probe
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
		return {"message": "Probe not found"}
	# Update Probe IP and MAC Address
	if (
		str(probe.ip_address) == ip
		and str(probe.mac_address) == mac_address
		and probe.serial_number == serial_number
	):
		return {"message": "Startup information unchanged"}
	probe.ip_address = ip
	probe.mac_address = mac_address
	probe.serial_number = serial_number
	await session.commit()
	return {"message": "Startup information recorded successfully"}


async def update_agent_ip(
	session: AsyncSession,
	zone_id: int,
	building_id: int,
	probe_id: int,
	ip: str,
	status: int,
) -> dict[str, str]:
	"""Endpoint for agents to report their IP address and status."""
	if status != 0:
		return {"message": "Invalid status code"}

	# Check Existence of Probe
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
		return {"message": "Probe not found"}
	# Update Probe IP
	if str(probe.ip_address) == ip:
		return {"message": "IP address unchanged"}
	probe.ip_address = ip
	await session.commit()
	return {"message": "IP address updated successfully"}
