import logging
from collections.abc import Sequence

from fastapi import HTTPException
from geoalchemy2.shape import from_shape
from shapely import MultiPolygon
from shapely.geometry import shape
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models.building import Building
from app.models.image import ZoneImage
from app.models.zone import Zone, ZoneCreate, ZoneUpdate
from app.services.storage import StorageService

logger = logging.getLogger(__name__)


async def get_all_zone(*, session: AsyncSession) -> Sequence[Zone]:
	statement = select(Zone).options(selectinload(Zone.images))
	results = await session.execute(statement)
	zones = results.scalars().all()
	return zones


async def get_all_zone_summary(*, session: AsyncSession) -> Sequence[Zone]:
	statement = select(Zone).order_by(Zone.name)
	results = await session.execute(statement)
	zones = results.scalars().all()
	return zones


async def get_zone(*, session: AsyncSession, zone_id: int) -> Zone | None:
	zone = await session.get(
		Zone,
		zone_id,
		options=[
			selectinload(Zone.images),
			selectinload(Zone.buildings).options(selectinload(Building.images)),
		],
	)
	return zone


async def create_zone(
	*, session: AsyncSession, storage: StorageService, zone_in: ZoneCreate
) -> Zone:
	try:
		geometry_wkt = None
		polygon_list = []
		if zone_in.geojson:
			# 1. รับค่า Raw Data มาก่อน
			raw_data = zone_in.geojson

			# 2. เช็คว่าเป็น FeatureCollection หรือไม่ (Terra Draw ชอบส่งมาแบบนี้)
			if raw_data.get("type") == "FeatureCollection":
				features = raw_data.get("features", [])
				if not features:
					raise ValueError("GeoJSON must contain at least one feature")

				# test multiple features
				for feature in features:
					geom_dict = feature["geometry"]
					polygon = shape(geom_dict)
					polygon_list.append(polygon)
				geometry_wkt = from_shape(MultiPolygon(polygon_list), srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse geojson: {str(e)}"
		)

	# create zone
	zone = Zone(
		name=zone_in.name,
		description=zone_in.description,
		color=zone_in.color,
		paths=geometry_wkt,
	)
	session.add(zone)

	# flush to get zone.id
	await session.flush()

	# create image
	if zone_in.images:
		for image in zone_in.images:
			try:
				image_url = await storage.upload_file(f"zones/{zone.id}", image)
				zone_image = ZoneImage(url=image_url, zone_id=zone.id)
				session.add(zone_image)
			except Exception as e:
				logger.error(f"Error creating image record: {e}")
				raise HTTPException(status_code=500, detail="Failed to upload image")

	await session.commit()
	await session.refresh(zone, attribute_names=["images"])
	return zone


async def update_zone(
	*,
	session: AsyncSession,
	storage: StorageService,
	zone_id: int,
	zone_update: ZoneUpdate,
) -> Zone:
	zone = await session.get(Zone, zone_id, options=[selectinload(Zone.images)])
	if not zone:
		raise HTTPException(status_code=404, detail="Zone not found")

	try:
		geometry_wkt = None
		polygon_list = []
		if zone_update.geojson:
			# 1. รับค่า Raw Data มาก่อน
			raw_data = zone_update.geojson

			# 2. เช็คว่าเป็น FeatureCollection หรือไม่ (Terra Draw ชอบส่งมาแบบนี้)
			if raw_data.get("type") == "FeatureCollection":
				features = raw_data.get("features", [])
				if not features:
					raise ValueError("GeoJSON must contain at least one feature")

				# test multiple features
				for feature in features:
					geom_dict = feature["geometry"]
					polygon = shape(geom_dict)
					polygon_list.append(polygon)
				# print(polygon_list)
				geometry_wkt = from_shape(MultiPolygon(polygon_list), srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse geojson: {str(e)}"
		)

	zone.name = zone_update.name
	zone.description = zone_update.description
	zone.color = zone_update.color
	zone.paths = geometry_wkt

	if zone_update.images:
		# add new images first
		for image in zone_update.images:
			try:
				image_url = await storage.upload_file(f"zones/{zone.id}", image)
				zone_image = ZoneImage(url=image_url, zone_id=zone.id)
				session.add(zone_image)
			except Exception as e:
				logger.error(f"Error creating image record: {e}")
				raise HTTPException(status_code=500, detail="Failed to upload image")

	if zone_update.deleted_images:
		# then delete specified images
		images_to_delete = [
			img
			for img in zone.images
			if any(
				image_del.filename == img.url
				for image_del in zone_update.deleted_images
			)
		]
		for img in images_to_delete:
			try:
				storage.delete_file_by_url(img.url)
				await session.delete(img)
			except Exception as e:
				logger.error(f"Error deleting image record: {e}")
				raise HTTPException(status_code=500, detail="Failed to delete image")

	session.add(zone)
	await session.commit()
	await session.refresh(zone, attribute_names=["images"])
	return zone
