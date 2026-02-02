from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import building as crud_building
from app.dependencies import RedisDep, SessionDep, StorageDep
from app.models.building import (
	Building,
	BuildingCreate,
	BuildingRead,
	BuildingReadProbe,
	BuildingReadProbeCount,
	BuildingReadRelation,
	BuildingUpdate,
)

router = APIRouter(
	prefix="/building",
	tags=["building"],
)


@router.get("", response_model=list[BuildingRead])
async def get_all_building(session: SessionDep) -> Sequence[Building]:
	# Retrieve all buildings from the database
	return await crud_building.get_all_building(session=session)


@router.get("/{building_id}", response_model=BuildingRead)
async def get_building(session: SessionDep, building_id: int) -> Building | None:
	# Retrieve specific building data
	building = await crud_building.get_building(
		session=session, building_id=building_id
	)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")
	return building


@router.get("/{building_id}/probes", response_model=BuildingReadProbe)
async def get_building_probe(session: SessionDep, building_id: int) -> Building | None:
	# Retrieve specific building data
	building = await crud_building.get_building_probe(
		session=session, building_id=building_id
	)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")
	return building


@router.get("/{building_id}/probes-count", response_model=BuildingReadProbeCount)
async def get_building_probe_count(
	session: SessionDep, redis_client: RedisDep, building_id: int
) -> Building | None:
	# Retrieve specific building data
	building = await crud_building.get_building_probe_count(
		session=session, redis_client=redis_client, building_id=building_id
	)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")
	return building


@router.get("/{building_id}/for-update", response_model=BuildingReadRelation)
async def get_building_for_update(
	session: SessionDep, building_id: int
) -> Building | None:
	# Retrieve specific building data for update
	building = await crud_building.get_building_for_update(
		session=session, building_id=building_id
	)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")
	return building


@router.post("", response_model=BuildingReadRelation)
async def create_building(
	session: SessionDep, storage: StorageDep, building_in: BuildingCreate
) -> Building:
	# Create a new building entry
	return await crud_building.create_building(
		session=session, storage=storage, building_in=building_in
	)


@router.put("/{building_id}", response_model=BuildingReadRelation)
async def update_building(
	session: SessionDep,
	storage: StorageDep,
	building_id: int,
	updated_data: BuildingUpdate,
) -> Building:
	# Update building data
	return await crud_building.update_building(
		session=session,
		storage=storage,
		building_id=building_id,
		building_update=updated_data,
	)
