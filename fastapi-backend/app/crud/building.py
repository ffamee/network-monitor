import logging
from collections.abc import Sequence

from fastapi import HTTPException
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.models.building import Building, BuildingCreate, BuildingUpdate
from app.models.image import BuildingImage
from app.models.probe import Probe
from app.models.zone import Zone
from app.services.redis import RedisService
from app.services.storage import StorageService

logger = logging.getLogger(__name__)


async def get_all_building(*, session: AsyncSession) -> Sequence[Building]:
	statement = select(Building).options(selectinload(Building.images))
	results = await session.execute(statement)
	buildings = results.scalars().all()
	return buildings


async def get_building(*, session: AsyncSession, building_id: int) -> Building | None:
	building = await session.get(
		Building, building_id, options=[selectinload(Building.images)]
	)
	return building


async def get_building_probe(
	*, session: AsyncSession, building_id: int
) -> Building | None:
	building = await session.get(
		Building,
		building_id,
		options=[
			selectinload(Building.images),
			selectinload(Building.probes).options(selectinload(Probe.images)),
		],
	)
	return building


async def get_building_probe_count(
	*, session: AsyncSession, redis_client: RedisService, building_id: int
) -> Building | None:
	building = await session.get(
		Building,
		building_id,
		options=[
			selectinload(Building.images),
			selectinload(Building.zone),
		],
	)
	if not building:
		return None

	statement = select(func.count(Probe.id)).where(Probe.building_id == building_id)
	result = await session.execute(statement)
	probe_count = result.scalar_one()
	object.__setattr__(building, "probe_count", probe_count)

	# count active probes from redis
	pattern = f"probe:status:{building.zone_id}:{building.id}"
	active_count = await redis_client.get_active_count(pattern)
	object.__setattr__(building, "probe_active", active_count)
	return building


async def get_building_for_update(
	*, session: AsyncSession, building_id: int
) -> Building | None:
	building = await session.get(
		Building,
		building_id,
		options=[selectinload(Building.images), selectinload(Building.zone)],
	)
	return building


async def create_building(
	*, session: AsyncSession, storage: StorageService, building_in: BuildingCreate
) -> Building:
	try:
		point = Point(building_in.lng, building_in.lat)
		geometry_wkt = from_shape(point, srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse coordinates: {str(e)}"
		)

	# check zone existence
	zone = await session.get(Zone, building_in.zone_id)
	if not zone:
		raise HTTPException(status_code=404, detail="Zone not found")

	# create building
	building = Building(
		name=building_in.name,
		floor=building_in.floor,
		admin=building_in.admin,
		tel=building_in.tel,
		address=building_in.address,
		google_place_id=building_in.google_place_id,
		location=geometry_wkt,
		zone_id=building_in.zone_id,
	)
	session.add(building)

	# commit to get building ID
	await session.flush()

	# handle images if any
	if building_in.images:
		for image in building_in.images:
			try:
				image_url = await storage.upload_file(f"buildings/{building.id}", image)
				building_image = BuildingImage(url=image_url, building_id=building.id)
				session.add(building_image)
			except Exception as e:
				logger.error(f"Error creating building image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to upload building image"
				)

	await session.commit()
	await session.refresh(building, attribute_names=["images", "zone"])
	return building


async def update_building(
	*,
	session: AsyncSession,
	storage: StorageService,
	building_id: int,
	building_update: BuildingUpdate,
) -> Building:
	building = await session.get(
		Building,
		building_id,
		options=[selectinload(Building.images), selectinload(Building.zone)],
	)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")

	try:
		point = Point(building_update.lng, building_update.lat)
		geometry_wkt = from_shape(point, srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse coordinates: {str(e)}"
		)

	# update building fields
	building.name = building_update.name
	building.floor = building_update.floor
	building.admin = building_update.admin
	building.tel = building_update.tel
	building.address = building_update.address
	building.google_place_id = building_update.google_place_id
	building.location = geometry_wkt

	if building.zone_id != building_update.zone_id:
		# check zone existence
		zone = await session.get(Zone, building_update.zone_id)
		if not zone:
			raise HTTPException(status_code=404, detail="Zone not found")
		building.zone_id = building_update.zone_id

	# handle new images
	if building_update.images:
		for image in building_update.images:
			try:
				image_url = await storage.upload_file(f"buildings/{building.id}", image)
				building_image = BuildingImage(url=image_url, building_id=building.id)
				session.add(building_image)
			except Exception as e:
				logger.error(f"Error creating building image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to upload building image"
				)

	# handle deleted images
	if building_update.deleted_images:
		images_to_delete = [
			img
			for img in building.images
			if any(
				image_del.filename == img.url
				for image_del in building_update.deleted_images
			)
		]
		for img in images_to_delete:
			try:
				storage.delete_file_by_url(img.url)
				await session.delete(img)
			except Exception as e:
				logger.error(f"Error deleting building image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to delete building image"
				)

	session.add(building)
	await session.commit()
	await session.refresh(building, attribute_names=["images", "zone"])
	return building
