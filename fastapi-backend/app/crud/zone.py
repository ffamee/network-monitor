from collections.abc import Sequence

from fastapi import HTTPException
from geoalchemy2.shape import from_shape
from shapely import MultiPolygon
from shapely.geometry import shape
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.zone import Zone, ZoneCreate, ZoneUpdate


async def get_all_zone(*, session: AsyncSession) -> Sequence[Zone]:
	statement = select(Zone)
	results = await session.execute(statement)
	zones = results.scalars().all()
	return zones


async def get_zone(*, session: AsyncSession, zone_id: int) -> Zone | None:
	zone = await session.get(Zone, zone_id)
	return zone


async def create_zone(*, session: AsyncSession, zone_in: ZoneCreate) -> Zone:
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
				# print(polygon_list)
				geometry_wkt = from_shape(MultiPolygon(polygon_list), srid=4326)
				# แกะเอา geometry จาก feature ตัวแรก
				# geom_dict = features[0]["geometry"]
				# geometry_wkt = from_shape(shape(geom_dict), srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse geojson: {str(e)}"
		)

	zone = Zone(
		name=zone_in.name,
		description=zone_in.description,
		color=zone_in.color,
		paths=geometry_wkt,
	)
	session.add(zone)
	await session.commit()
	await session.refresh(zone)
	return zone


async def update_zone(
	*, session: AsyncSession, zone_id: int, zone_update: ZoneUpdate
) -> Zone:
	zone = await session.get(Zone, zone_id)
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

	session.add(zone)
	await session.commit()
	await session.refresh(zone)
	return zone
