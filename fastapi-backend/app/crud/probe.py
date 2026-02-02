import calendar
import logging
from collections.abc import Sequence
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import or_, select

from app.models.building import Building
from app.models.event import Event
from app.models.image import ProbeImage
from app.models.probe import Probe, ProbeCreate, ProbeUpdate
from app.services.redis import RedisService
from app.services.storage import StorageService

logger = logging.getLogger(__name__)


async def get_all_probe(*, session: AsyncSession) -> Sequence[Probe]:
	statement = select(Probe).options(selectinload(Probe.images))
	results = await session.execute(statement)
	probes = results.scalars().all()
	return probes


async def get_probe(
	*, session: AsyncSession, redis_client: RedisService, probe_id: int
) -> Probe | None:
	probe = await session.get(
		Probe,
		probe_id,
		options=[
			selectinload(Probe.images),
			selectinload(Probe.building),
		],
	)
	redis_key = f"probe:status:{probe.building.zone_id}:{probe.building_id}"
	data = await redis_client.check_is_online(redis_key, str(probe.id))
	if data:
		object.__setattr__(probe, "status", "online")
	else:
		object.__setattr__(probe, "status", "offline")
	uptime = await redis_client.get_uptime(redis_key, str(probe.id))
	object.__setattr__(probe, "uptime", uptime)
	return probe


async def get_probe_for_update(*, session: AsyncSession, probe_id: int) -> Probe | None:
	probe = await session.get(
		Probe,
		probe_id,
		options=[
			selectinload(Probe.images),
			selectinload(Probe.building).options(selectinload(Building.zone)),
		],
	)
	return probe


async def get_probes_by_building(
	*, session: AsyncSession, redis_client: RedisService, building_id: int
) -> Sequence[Probe]:
	statement = (
		select(Probe)
		.where(Probe.building_id == building_id)
		.options(selectinload(Probe.images))
	)
	results = await session.execute(statement)
	probes = results.scalars().all()

	# get zone id for building
	statement_zone = (
		select(Building)
		.where(Building.id == building_id)
		.options(selectinload(Building.zone))
	)
	result_zone = await session.execute(statement_zone)
	building = result_zone.scalars().one()

	if not building:
		raise HTTPException(status_code=404, detail="Building not found")

	# extend with probe status from Redis
	for probe in probes:
		redis_key = f"probe:status:{building.zone_id}:{building_id}"
		data = await redis_client.check_is_online(redis_key, str(probe.id))
		if data:
			object.__setattr__(probe, "status", "online")
		else:
			object.__setattr__(probe, "status", "offline")
		uptime = await redis_client.get_uptime(redis_key, str(probe.id))
		object.__setattr__(probe, "uptime", uptime)
	return probes


async def get_probe_monthly_status(session: AsyncSession, probe_id: int) -> dict:
	# Get the current year and month
	now = datetime.now()
	year = now.year
	month = now.month

	# Get the number of days in the current month
	[first_weekday, num_days] = calendar.monthrange(year, month)

	statement = select(Event).where(
		Event.probe_id == probe_id,
		Event.started_at <= datetime(year, month, num_days, 23, 59, 59),
		or_(Event.resolved_at.is_(None), Event.resolved_at >= datetime(year, month, 1)),
	)
	result = await session.execute(statement)
	events = result.scalars().all()
	daily_events: dict[int, list[int]] = {}
	events_score = {"critical": 3, "warning": 2, "info": 1}
	for event in events:
		start_date = event.started_at.astimezone(ZoneInfo("Asia/Bangkok"))
		day = start_date.day
		if day not in daily_events:
			daily_events[day] = [0, 0, 0]  # info, warning, critical
		daily_events[day][events_score[event.severity] - 1] += 1
		end_day = (
			event.resolved_at.astimezone(ZoneInfo("Asia/Bangkok")).day
			if event.resolved_at
			else num_days
		)
		if end_day + 1 not in daily_events:
			daily_events[end_day + 1] = [0, 0, 0]
		daily_events[end_day + 1][events_score[event.severity] - 1] -= 1
	result_status: dict[int, str] = {}
	start_status = [1, 0, 0]  # info, warning, critical
	for day in range(1, max(num_days, now.day) + 1):
		if day in daily_events:
			# Update start_status
			for i in range(3):
				start_status[i] += daily_events[day][i]
			# Determine status for the day
			if start_status[2] > 0:
				result_status[day] = "critical"
			elif start_status[1] > 0:
				result_status[day] = "warning"
			elif start_status[0] > 0:
				result_status[day] = "info"
			else:
				result_status[day] = "no-data"
		else:
			# No events for the day
			if start_status[2] > 0:
				result_status[day] = "critical"
			elif start_status[1] > 0:
				result_status[day] = "warning"
			elif start_status[0] > 0:
				result_status[day] = "info"
			else:
				result_status[day] = "no-data"
	for day in range(now.day + 1, num_days + 1):
		result_status[day] = "no-data"
	return {"skip": (first_weekday + 1) % 7, "status": result_status}


async def get_probe_events(
	*,
	session: AsyncSession,
	probe_id: int,
	date: str | None = None,
	skip: int = 0,
	limit: int = 10,
) -> dict[str, object]:
	# if date not exists, return all events with pagination ordered by started_at desc
	if date is None:
		statement = (
			select(Event)
			.where(Event.probe_id == probe_id)
			.order_by(Event.started_at.desc())
			.offset(skip)
			.limit(limit)
		)
		result = await session.execute(statement)
		events = result.scalars().all()
		return {"events": events, "count": len(events)}
	else:
		# filter by date return all events effect this date with pagination ordered by started_at desc
		# effect : start in this date or not resolved yet or resolved in this date
		start_datetime = datetime.strptime(date, "%Y-%m-%d")
		end_datetime = start_datetime.replace(
			hour=23, minute=59, second=59, microsecond=999999
		)
		statement = (
			select(Event)
			.where(
				Event.probe_id == probe_id,
				Event.started_at <= end_datetime,
				or_(
					Event.resolved_at.is_(None),
					Event.resolved_at >= start_datetime,
				),
			)
			.order_by(Event.started_at.desc())
			.offset(skip)
			.limit(limit)
		)
		result = await session.execute(statement)
		events = result.scalars().all()
		return {"date": date, "events": events, "count": len(events)}


async def create_probe(
	*, session: AsyncSession, storage: StorageService, probe_in: ProbeCreate
) -> Probe:
	try:
		point = Point(probe_in.lng, probe_in.lat)
		geometry_wkt = from_shape(point, srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse coordinates: {str(e)}"
		)

	# check building existence
	building = await session.get(Building, probe_in.building_id)
	if not building:
		raise HTTPException(status_code=404, detail="Building not found")

	# create probe
	probe = Probe(
		name=probe_in.name,
		floor=probe_in.floor,
		serial_number=probe_in.serial_number,
		description=probe_in.description,
		address=probe_in.address,
		google_place_id=probe_in.google_place_id,
		location=geometry_wkt,
		building_id=probe_in.building_id,
	)
	session.add(probe)

	# commit to get probe ID
	await session.flush()

	# handle images if any
	if probe_in.images:
		for image in probe_in.images:
			try:
				image_url = await storage.upload_file(f"probes/{probe.id}", image)
				probe_image = ProbeImage(url=image_url, probe_id=probe.id)
				session.add(probe_image)
			except Exception as e:
				logger.error(f"Error creating probe image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to upload probe image"
				)

	await session.commit()
	# await session.refresh(
	# 	probe, attribute_names=["images", "building"]
	# )

	statement = (
		select(Probe)
		.where(Probe.id == probe.id)
		.options(
			selectinload(Probe.images),
			selectinload(Probe.building).options(selectinload(Building.zone)),
		)
	)
	query = await session.execute(statement)
	query = query.scalars().one()
	return query


async def update_probe(
	*,
	session: AsyncSession,
	storage: StorageService,
	probe_id: int,
	probe_update: ProbeUpdate,
) -> Probe:
	probe = await session.get(
		Probe,
		probe_id,
		options=[
			selectinload(Probe.images),
			selectinload(Probe.building).options(selectinload(Building.zone)),
		],
	)
	if not probe:
		raise HTTPException(status_code=404, detail="Probe not found")

	try:
		point = Point(probe_update.lng, probe_update.lat)
		geometry_wkt = from_shape(point, srid=4326)
	except Exception as e:
		raise HTTPException(
			status_code=400, detail=f"Failed to parse coordinates: {str(e)}"
		)

	# update probe fields
	probe.name = probe_update.name
	probe.floor = probe_update.floor
	probe.serial_number = probe_update.serial_number
	probe.description = probe_update.description
	probe.address = probe_update.address
	probe.google_place_id = probe_update.google_place_id
	probe.location = geometry_wkt

	if probe.building_id != probe_update.building_id:
		# check building existence
		building = await session.get(Building, probe_update.building_id)
		if not building:
			raise HTTPException(status_code=404, detail="Building not found")
		probe.building_id = probe_update.building_id

	# handle new images
	if probe_update.images:
		for image in probe_update.images:
			try:
				image_url = await storage.upload_file(f"probes/{probe.id}", image)
				probe_image = ProbeImage(url=image_url, probe_id=probe.id)
				session.add(probe_image)
			except Exception as e:
				logger.error(f"Error creating probe image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to upload probe image"
				)

	# handle deleted images
	if probe_update.deleted_images:
		images_to_delete = [
			img
			for img in probe.images
			if any(
				image_del.filename == img.url
				for image_del in probe_update.deleted_images
			)
		]
		for img in images_to_delete:
			try:
				storage.delete_file_by_url(img.url)
				await session.delete(img)
			except Exception as e:
				logger.error(f"Error deleting probe image: {str(e)}")
				raise HTTPException(
					status_code=500, detail="Failed to delete probe image"
				)

	session.add(probe)
	await session.commit()
	statement = (
		select(Probe)
		.where(Probe.id == probe.id)
		.options(
			selectinload(Probe.images),
			selectinload(Probe.building).options(selectinload(Building.zone)),
		)
	)
	query = await session.execute(statement)
	query = query.scalars().one()
	return query
