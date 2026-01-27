from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import zone as crud_zone
from app.dependencies import SessionDep, StorageDep
from app.models.zone import Zone, ZoneCreate, ZoneRead, ZoneUpdate

router = APIRouter(
	prefix="/zone",
	tags=["zone"],
)


@router.get("", response_model=list[ZoneRead])
async def get_all_zone(session: SessionDep) -> Sequence[Zone]:
	# return all zones from database
	return await crud_zone.get_all_zone(session=session)


@router.get("/{zone_id}", response_model=ZoneRead)
async def get_zone(session: SessionDep, zone_id: int) -> Zone:
	# return zone from zone_id
	zone = await crud_zone.get_zone(session=session, zone_id=zone_id)

	if not zone:
		raise HTTPException(status_code=404, detail="Zone not found")
	return zone


# 	return {
# 		**result,
# 		"images": images,
# 		"totalBuildings": 8,
# 		"totalProbes": len(result["locations"]),
# 	}
# return {"error": "Zone not found"}


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
