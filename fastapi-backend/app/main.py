import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import agent, building, grafana, influx, minio, pings, probe, zone
from app.services.redis import lifespan_redis
from app.tasks.heartbeat import check_offline_probes_task

logger = logging.getLogger(__name__)
# สร้างตัว Scheduler
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(_: FastAPI):
	"""Manage application lifespan with services."""
	async with lifespan_redis():
		scheduler.add_job(
			check_offline_probes_task,
			trigger=IntervalTrigger(minutes=1),  # เช็คทุก 1 นาที
			id="offline_checker",
			replace_existing=True,
			max_instances=1,
		)
		scheduler.start()
		yield
		scheduler.shutdown()


app = FastAPI(lifespan=lifespan)

origin = ["http://localhost:3000", "http://localhost:8000", "http://192.168.1.127:3000"]
# origin = ["*"]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origin,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(building.router)
app.include_router(influx.router)
app.include_router(grafana.router)
app.include_router(minio.router)
app.include_router(pings.router)
app.include_router(probe.router)
app.include_router(zone.router)
app.include_router(agent.router)


@app.get("/")
def read_root() -> dict[str, str]:
	return {"message": "Hello World"}
