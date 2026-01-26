import logging
from collections.abc import Sequence

from fastapi import HTTPException
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models.building import Building, BuildingCreate

logger = logging.getLogger(__name__)


async def get_all_building(*, session: AsyncSession) -> Sequence[Building]:
	statement = select(Building).options(selectinload(Building.images))
	results = await session.execute(statement)
	buildings = results.scalars().all()
	return buildings


async def create_building(
	*, session: AsyncSession, building_in: BuildingCreate
) -> Building:
	try:
		point = Point(building_in.lng, building_in.lat)
		geometry_wkt = from_shape(point, srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse coordinates: {str(e)}"
		)

	# create building
	building = Building(
		name=building_in.name,
		floor=building_in.floor,
		admin=building_in.admin,
		tel=building_in.tel,
		address=building_in.address,
		google_place_id=building_in.google_place_id,
		location=geometry_wkt,
	)

	session.add(building)
	await session.commit()
	await session.refresh(building, attribute_names=["images"])
	return building
