from fastapi import APIRouter

from app.crud import influx as influx_crud
from app.dependencies import InfluxDep

router = APIRouter(
	prefix="/influx",
	tags=["influx"],
)


@router.get("/bandwidth/{building_id}")
async def get_mean_bandwidth(influxdb_client: InfluxDep, building_id: int):
	return await influx_crud.get_mean_bandwidth(influxdb_client, building_id)
