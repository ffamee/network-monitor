from typing import Any

from fastapi import APIRouter, Body, HTTPException

from app.crud import agent as crud_agent
from app.dependencies import RedisDep, SessionDep

router = APIRouter(
	prefix="/agent",
	tags=["agent"],
)


@router.post("/startup")
async def agent_startup(
	session: SessionDep, message: dict[str, Any] = Body(...)
) -> dict[str, str]:
	"""Receive startup messages from agents and log them.

	Expected body format:
	{
		'id': 'agent-11/16/6',  # agent-{zone_id}/{building_id}/{probe_id}
		'ip': '192.168.1.1',
		'mac_address': '00:1A:2B:3C:4D:5E',
		'serial_number': '123456789',
	}
	"""
	agent_id = message.get("id")
	if not agent_id:
		raise HTTPException(status_code=400, detail="Missing 'id' field in message")

	# Parse agent ID: agent-{zone_id}/{building_id}/{probe_id}
	try:
		# Remove 'agent-' prefix and split by '/'
		id_parts = agent_id.replace("agent-", "").split("/")
		if len(id_parts) != 3:
			raise ValueError("Invalid ID format")
		zone_id, building_id, probe_id = id_parts
	except ValueError:
		raise HTTPException(
			status_code=400,
			detail=f"Invalid agent ID format. Expected 'agent-{{zone}}/{{building}}/{{probe}}', got '{agent_id}'",
		)

	return await crud_agent.set_startup(
		session=session,
		zone_id=int(zone_id),
		building_id=int(building_id),
		probe_id=int(probe_id),
		ip=message.get("ip", ""),
		mac_address=message.get("mac_address", ""),
		serial_number=message.get("serial_number", ""),
	)


@router.post("/ip")
async def report_ip(
	session: SessionDep, message: dict[str, Any] = Body(...)
) -> dict[str, str]:
	"""Receive IP address reports from agents and log them.

	Expected body format:
	{
		'metrics': [
			{
				'fields': { 'ip': '192.168.1.1', 'status': 0 },
				'name': 'exec_ip',
				'tags': { 'building_id': '16', 'host': 'probe1', 'interface': 'eth0', 'probe_id': '6', 'zone_id': '11'},
				'timestamp': 1769937049
			}
		]
	}

	"""
	raw = message.get("metrics", [])
	data = raw[-1] if raw else {}
	fields = data.get("fields", {})
	tags = data.get("tags", {})
	print(f"Received IP report: fields={fields}, tags={tags}")
	ip = fields.get("ip")
	status = fields.get("status")
	zone_id = tags.get("zone_id")
	building_id = tags.get("building_id")
	probe_id = tags.get("probe_id")
	return await crud_agent.update_agent_ip(
		session=session,
		zone_id=int(zone_id),
		building_id=int(building_id),
		probe_id=int(probe_id),
		ip=ip,
		status=int(status),
	)


@router.post("/heartbeat")
async def agent_heartbeat(
	session: SessionDep, redis_client: RedisDep, message: dict[str, Any] = Body(...)
) -> dict[str, str]:
	"""Receive heartbeat messages from agents and log them.

	Expected body format:
	{
		'id': 'agent-11/16/6',  # agent-{zone_id}/{building_id}/{probe_id}
		'version': 'Telegraf 1.37.1',
		'schema': 1,
		'last': 1769733788,
		'hostname': 'docker-desktop',
		'statistics': {'errors': 4, 'warnings': 0, 'metrics': 593}
	}
	"""
	agent_id = message.get("id")
	if not agent_id:
		raise HTTPException(status_code=400, detail="Missing 'id' field in message")

	# Parse agent ID: agent-{zone_id}/{building_id}/{probe_id}
	try:
		# Remove 'agent-' prefix and split by '/'
		id_parts = agent_id.replace("agent-", "").split("/")
		if len(id_parts) != 3:
			raise ValueError("Invalid ID format")
		zone_id, building_id, probe_id = id_parts
	except ValueError:
		raise HTTPException(
			status_code=400,
			detail=f"Invalid agent ID format. Expected 'agent-{{zone}}/{{building}}/{{probe}}', got '{agent_id}'",
		)

	# Create Redis key using the full agent ID
	redis_key = f"probe:status:{zone_id}:{building_id}"

	# update device heartbeat
	await redis_client.update_heartbeat(session, redis_key, probe_id)

	return {"status": "ok", "key": redis_key}
