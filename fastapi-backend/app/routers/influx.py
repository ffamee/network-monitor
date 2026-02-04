from fastapi import APIRouter

from app.crud import influx as influx_crud
from app.dependencies import InfluxDep

router = APIRouter(
	prefix="/influx",
	tags=["influx"],
)


@router.get("/bandwidth/{building_id}")
async def get_building_mean_bandwidth(influxdb_client: InfluxDep, building_id: int):
	# Retrieve mean bandwidth for a specific building
	return await influx_crud.get_building_mean_bandwidth(influxdb_client, building_id)


@router.get("/bandwidth/probe/{probe_id}")
async def get_probe_mean_bandwidth(influxdb_client: InfluxDep, probe_id: int):
	# Retrieve mean bandwidth for a specific probe
	return await influx_crud.get_probe_mean_bandwidth(influxdb_client, probe_id)


@router.get("/internal/latency/{probe_id}")
async def get_probe_mean_internal_latency(influxdb_client: InfluxDep, probe_id: int):
	# Retrieve mean internal latency for a specific probe
	return await influx_crud.get_probe_mean_internal_latency(influxdb_client, probe_id)


@router.get("/external/latency/{probe_id}")
async def get_probe_mean_external_latency(influxdb_client: InfluxDep, probe_id: int):
	# Retrieve mean external latency for a specific probe
	return await influx_crud.get_probe_mean_external_latency(influxdb_client, probe_id)


@router.get("/dns/{probe_id}")
async def get_probe_mean_dns_query(influxdb_client: InfluxDep, probe_id: int):
	# Retrieve mean DNS query time for a specific probe
	return await influx_crud.get_probe_mean_dns_query(influxdb_client, probe_id)


@router.get("/ping/{probe_id}")
async def get_probe_mean_ping_latency(influxdb_client: InfluxDep, probe_id: int):
	# Retrieve mean ping latency for a specific probe
	return await influx_crud.get_probe_mean_ping_latency(influxdb_client, probe_id)
