from collections.abc import Sequence

from fastapi import APIRouter, HTTPException

from app.crud import probe as crud_probe
from app.dependencies import SessionDep, StorageDep
from app.models.probe import (
	Probe,
	ProbeCreate,
	ProbeRead,
	ProbeReadRelation,
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


@router.get("/{probe_id}", response_model=ProbeRead)
async def get_probe(session: SessionDep, probe_id: int) -> Probe | None:
	# Retrieve specific probe data
	probe = await crud_probe.get_probe(session=session, probe_id=probe_id)
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


# ===== DEMO DATA BELOW - KEEP FOR NOW =====
import asyncio
import calendar
import math
from datetime import datetime

probe_demo = {
	"id": "PB-001",
	"name": "Main Gateway - Fl.1",
	"type": "Router / Gateway",
	"ip": "192.168.1.1",
	"serialNumber": "SN-7788-X1",
	"mac": "00:1B:44:11:3A:B7",
	"location": "Server Room A, Rack 2",
	"status": "online",
	"uptime": "45d 12h 30m",
	"lastSeen": "Just now",
	"firmware": "v2.4.5-stable",
	"model": "Enterprise Gateway XG-7100",
	"installDate": "15 Jan 2023",
	"temperature": 42,
	"cpuLoad": 28,
	"memoryUsage": 45,
	"lat": 13.850022570498957,
	"lng": 100.57101354002953,
}

# add type for each event (info, warning, error)
events = {
	"2026-01-01": [
		{"type": "info", "timestamp": "2026-01-01T08:00:00Z", "event": "Probe started"},
		{
			"type": "info",
			"timestamp": "2026-01-01T12:30:00Z",
			"event": "Firmware updated to v2.4.5-stable",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-01T15:45:00Z",
			"event": "High CPU load detected (85%)",
		},
	],
	"2026-01-02": [
		{
			"type": "warning",
			"timestamp": "2026-01-02T09:15:00Z",
			"event": "Temperature threshold exceeded (90°C)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-02T10:00:00Z",
			"event": "Temperature normalized (42°C)",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-02T14:20:00Z",
			"event": "Memory usage high (95%)",
		},
	],
	"2026-01-03": [
		{
			"type": "info",
			"timestamp": "2026-01-03T11:00:00Z",
			"event": "Probe restarted",
		},
		{
			"type": "info",
			"timestamp": "2026-01-03T13:30:00Z",
			"event": "New device connected: Device ID 12345",
		},
	],
	"2026-01-04": [
		{
			"type": "info",
			"timestamp": "2026-01-04T07:45:00Z",
			"event": "Routine maintenance check completed",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-04T12:15:00Z",
			"event": "Network latency detected",
		},
	],
	"2026-01-05": [
		{
			"type": "info",
			"timestamp": "2026-01-05T10:00:00Z",
			"event": "Scheduled maintenance completed",
		},
		{
			"type": "info",
			"timestamp": "2026-01-05T16:45:00Z",
			"event": "Firmware updated to v2.4.6-beta",
		},
	],
	"2026-01-06": [
		{
			"type": "warning",
			"timestamp": "2026-01-06T13:30:00Z",
			"event": "High memory usage detected (93%)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-06T14:15:00Z",
			"event": "Memory usage normalized (40%)",
		},
	],
	"2026-01-07": [
		{
			"type": "error",
			"timestamp": "2026-01-07T09:30:00Z",
			"event": "Probe went offline",
		},
		{
			"type": "info",
			"timestamp": "2026-01-07T10:15:00Z",
			"event": "Probe back online",
		},
	],
	"2026-01-08": [
		{
			"type": "warning",
			"timestamp": "2026-01-08T14:00:00Z",
			"event": "High network latency detected",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T15:30:00Z",
			"event": "Network latency normalized",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T16:45:00Z",
			"event": "New device disconnected: Device ID 12345",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-08T17:15:00Z",
			"event": "CPU load spike detected (90%)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T18:00:00Z",
			"event": "CPU load normalized (28%)",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-08T19:30:00Z",
			"event": "Memory usage spike detected (92%)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T20:15:00Z",
			"event": "Memory usage normalized (45%)",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-08T21:00:00Z",
			"event": "Temperature spike detected (85°C)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T22:30:00Z",
			"event": "Temperature normalized (42°C)",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:45:00Z",
			"event": "Probe performance optimized",
		},
		# more 10 events
		{
			"type": "info",
			"timestamp": "2026-01-08T23:50:00Z",
			"event": "Routine check completed",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:55:00Z",
			"event": "All systems operational",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:58:00Z",
			"event": "No issues detected",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:00Z",
			"event": "End of day summary generated",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:30Z",
			"event": "Backup of probe data completed",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:45Z",
			"event": "System logs archived",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:50Z",
			"event": "Performance metrics recorded",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:55Z",
			"event": "Probe ready for next day",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-08T23:59:59Z",
			"event": "Minor glitch detected, resolved automatically",
		},
		{
			"type": "error",
			"timestamp": "2026-01-08T23:59:59Z",
			"event": "False alarm: No critical issues found",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:50:00Z",
			"event": "Routine check completed",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:55:00Z",
			"event": "All systems operational",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:58:00Z",
			"event": "No issues detected",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:00Z",
			"event": "End of day summary generated",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:30Z",
			"event": "Backup of probe data completed",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:45Z",
			"event": "System logs archived",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:50Z",
			"event": "Performance metrics recorded",
		},
		{
			"type": "info",
			"timestamp": "2026-01-08T23:59:55Z",
			"event": "Probe ready for next day",
		},
		{
			"type": "warning",
			"timestamp": "2026-01-08T23:59:59Z",
			"event": "Minor glitch detected, resolved automatically",
		},
		{
			"type": "error",
			"timestamp": "2026-01-08T23:59:59Z",
			"event": "False alarm: No critical issues found",
		},
	],
	"2026-01-09": [
		{
			"type": "info",
			"timestamp": "2026-01-09T10:30:00Z",
			"event": "New device connected: Device ID 67890",
		},
	],
	"2026-01-10": [
		{
			"type": "info",
			"timestamp": "2026-01-10T08:30:00Z",
			"event": "Probe diagnostics run",
		},
		{
			"type": "info",
			"timestamp": "2026-01-10T12:00:00Z",
			"event": "No issues found during diagnostics",
		},
	],
	"2026-01-11": [
		{
			"type": "info",
			"timestamp": "2026-01-11T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-12": [
		{
			"type": "info",
			"timestamp": "2026-01-12T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-13": [
		{
			"type": "info",
			"timestamp": "2026-01-13T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-14": [
		{
			"type": "info",
			"timestamp": "2026-01-14T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-15": [
		{
			"type": "info",
			"timestamp": "2026-01-15T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-16": [
		{
			"type": "info",
			"timestamp": "2026-01-16T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-17": [
		{
			"type": "info",
			"timestamp": "2026-01-17T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-18": [
		{
			"type": "info",
			"timestamp": "2026-01-18T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
	"2026-01-19": [
		{
			"type": "info",
			"timestamp": "2026-01-19T09:00:00Z",
			"event": "Routine system check completed",
		},
	],
}


# get probe events query by date and pagination
@router.get("/events/{probe_slug}")
async def get_probe_events(
	probe_slug: str, date: str | None = None, skip: int = 0, limit: int = 5
) -> dict[str, object]:
	print(f"Requested events for probe: {probe_slug}")
	# set 0.5 second delay to simulate real api call
	await asyncio.sleep(0.2)
	if date is not None:
		print(f"Filtering events by date: {date}, skip: {skip}, limit: {limit}")
		# return events for the date with pagination
		if date in events:
			return {
				"date": date,
				"events": events[date][skip : skip + limit],
				"count": math.ceil(len(events[date]) / limit),
			}
		else:
			return {"date": date, "events": [], "count": 0}
	else:
		print(f"Returning all events with pagination, skip: {skip}, limit: {limit}")
		# return all events with pagination
		all_events = []
		for date_events in events.values():
			all_events.extend(date_events)
		return {
			"events": all_events[skip : skip + limit],
			"count": math.ceil(len(all_events) / limit),
		}


@router.get("/{probe_slug}/monthly-status")
async def get_probe_monthly_status(probe_slug: str) -> dict[str, object]:
	print(f"Requested status for probe: {probe_slug}")
	# set 0.2 second delay to simulate real api call
	await asyncio.sleep(0.2)
	# return key as day in this month and value as the most important status of that day
	result = {}
	# loop all days in this month

	# Get the current year and month
	now = datetime.now()
	year = now.year
	month = now.month

	# Get the number of days in the current month
	[first_weekday, num_days] = calendar.monthrange(year, month)

	# Add skip info for the first weekday
	result.update({"skip": (first_weekday + 1) % 7, "status": {}})
	# Loop through each day in the month
	for day in range(1, num_days + 1):
		date_str = f"{year}-{month:02d}-{day:02d}"
		print(date_str)
		if date_str not in events:
			result["status"][date_str] = "no-data"
		elif any(event["type"] == "error" for event in events[date_str]):
			result["status"][date_str] = "error"
		elif any(event["type"] == "warning" for event in events[date_str]):
			result["status"][date_str] = "warning"
		else:
			result["status"][date_str] = "info"
	return result
