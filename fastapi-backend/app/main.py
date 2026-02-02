import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import agent, building, grafana, influx, minio, pings, probe, zone
from app.services.redis import lifespan_redis

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
	"""Manage application lifespan with services."""
	async with lifespan_redis():
		yield


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
