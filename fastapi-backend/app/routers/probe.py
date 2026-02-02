from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import probe as crud_probe
from app.dependencies import RedisDep, SessionDep, StorageDep
from app.models.probe import (
	Probe,
	ProbeCreate,
	ProbeMonthlyStatus,
	ProbeRead,
	ProbeReadDetail,
	ProbeReadRelation,
	ProbeReadTable,
	ProbeUpdate,
)

router = APIRouter(
	prefix="/probe",
	tags=["probe"],
)


@router.get("", response_model=list[ProbeRead])
async def get_all_probe(session: SessionDep) -> Sequence[Probe]:
	# Retrieve all probes from the database
	return await crud_probe.get_all_probe(session=session)


@router.get("/{probe_id}", response_model=ProbeReadDetail)
async def get_probe(
	session: SessionDep, redis_client: RedisDep, probe_id: int
) -> Probe | None:
	# Retrieve specific probe data
	probe = await crud_probe.get_probe(
		session=session, redis_client=redis_client, probe_id=probe_id
	)
	if not probe:
		raise HTTPException(status_code=404, detail="Probe not found")
	return probe


@router.get("/{probe_id}/for-update", response_model=ProbeReadRelation)
async def get_probe_for_update(session: SessionDep, probe_id: int) -> Probe | None:
	# Retrieve specific probe data for update
	probe = await crud_probe.get_probe_for_update(session=session, probe_id=probe_id)
	if not probe:
		raise HTTPException(status_code=404, detail="Probe not found")
	return probe


@router.get("/building/{building_id}", response_model=list[ProbeReadTable])
async def get_probes_by_building(
	session: SessionDep, redis_client: RedisDep, building_id: int
) -> Sequence[Probe]:
	# Retrieve probes associated with a specific building
	probes = await crud_probe.get_probes_by_building(
		session=session, redis_client=redis_client, building_id=building_id
	)
	return probes


@router.get("/{probe_id}/monthly-status")
async def get_probe_monthly_status(
	session: SessionDep, probe_id: int
) -> ProbeMonthlyStatus:
	return await crud_probe.get_probe_monthly_status(session=session, probe_id=probe_id)


@router.get(
	"/{probe_id}/events",
	response_model_exclude={"events": {"__all__": {"id", "probe_id"}}},
)
async def get_probe_events(
	session: SessionDep,
	probe_id: int,
	date: str | None = None,
	skip: int = 0,
	limit: int = 10,
) -> dict[str, object]:
	return await crud_probe.get_probe_events(
		session=session, probe_id=probe_id, date=date, skip=skip, limit=limit
	)


@router.post("", response_model=ProbeReadRelation)
async def create_probe(
	session: SessionDep, storage: StorageDep, probe_in: ProbeCreate
) -> Probe:
	# Create a new probe entry
	return await crud_probe.create_probe(
		session=session, storage=storage, probe_in=probe_in
	)


@router.put("/{probe_id}", response_model=ProbeReadRelation)
async def update_probe(
	session: SessionDep,
	storage: StorageDep,
	probe_id: int,
	updated_data: ProbeUpdate,
) -> Probe:
	# Update probe data
	return await crud_probe.update_probe(
		session=session,
		storage=storage,
		probe_id=probe_id,
		probe_update=updated_data,
	)
