from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import zone as crud_zone
from app.dependencies import SessionDep, StorageDep
from app.models.zone import (
	Zone,
	ZoneCreate,
	ZoneRead,
	ZoneReadBuilding,
	ZoneReadBuildingSummary,
	ZoneReadMap,
	ZoneReadSummary,
	ZoneUpdate,
)

router = APIRouter(
	prefix="/zone",
	tags=["zone"],
)


@router.get("", response_model=list[ZoneRead])
async def get_all_zone(session: SessionDep) -> Sequence[Zone]:
	# return all zones from database
	return await crud_zone.get_all_zone(session=session)


@router.get(
	"/summary",
	response_model=list[ZoneReadSummary],
	# response_model_include={"__all__": {"id", "name"}},
)
async def get_zones_summary(session: SessionDep) -> Sequence[Zone]:
	# return all zones from database
	return await crud_zone.get_all_zone_summary(session=session)


@router.get(
	"/buildings-summary",
	response_model=list[ZoneReadBuildingSummary],
)
async def get_zones_buildings_summary(session: SessionDep) -> Sequence[Zone]:
	# return all zones with buildings from database
	return await crud_zone.get_all_zone_buildings_summary(session=session)


@router.get("/map", response_model=list[ZoneReadMap])
async def get_zones_map(session: SessionDep) -> Sequence[Zone]:
	# return all zones with building and probe counts for map display
	return await crud_zone.get_zones_map_data(session=session)


@router.get("/map/{zone_id}", response_model=ZoneReadMap)
async def get_zone_map(session: SessionDep, zone_id: int) -> Zone:
	# return zone with building and probe counts for map display
	zone = await crud_zone.get_zone_map_data(session=session, zone_id=zone_id)

	if not zone:
		raise HTTPException(status_code=404, detail="Zone not found")
	return zone


@router.get("/{zone_id}", response_model=ZoneReadBuilding)
async def get_zone(session: SessionDep, zone_id: int) -> Zone:
	# return zone from zone_id
	zone = await crud_zone.get_zone(session=session, zone_id=zone_id)

	if not zone:
		raise HTTPException(status_code=404, detail="Zone not found")
	return zone


@router.post("", response_model=ZoneRead)
async def create_zone(
	session: SessionDep, storage: StorageDep, zone_in: ZoneCreate
) -> Zone:
	# create new zone in database
	zone = await crud_zone.create_zone(
		session=session, storage=storage, zone_in=zone_in
	)
	return zone


@router.put("/{zone_id}", response_model=ZoneRead)
async def update_zone(
	session: SessionDep, storage: StorageDep, zone_id: int, updated_data: ZoneUpdate
) -> Zone:
	# update zone data in database
	zone = await crud_zone.update_zone(
		session=session, storage=storage, zone_id=zone_id, zone_update=updated_data
	)
	return zone
