from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import building as crud_building
from app.dependencies import SessionDep, StorageDep
from app.models.building import (
	Building,
	BuildingCreate,
	BuildingRead,
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


@router.post("", response_model=BuildingRead)
async def create_building(
	session: SessionDep, storage: StorageDep, building_in: BuildingCreate
) -> Building:
	return await crud_building.create_building(
		session=session, storage=storage, building_in=building_in
	)


@router.put("/{building_id}", response_model=BuildingRead)
async def update_building(
	session: SessionDep,
	storage: StorageDep,
	building_id: int,
	updated_data: BuildingUpdate,
) -> dict[str, str]:
	# Update building data
	return await crud_building.update_building(
		session=session,
		storage=storage,
		building_id=building_id,
		building_update=updated_data,
	)
