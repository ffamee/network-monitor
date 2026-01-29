import logging

# from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import building, minio, pings, probe, zone
from app.services.mqtt import fast_mqtt

logger = logging.getLogger(__name__)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
# 	# Startup
# 	await fast_mqtt.mqtt_startup()
# 	logger.info("MQTT started")
# 	yield
# 	# Shutdown
# 	await fast_mqtt.mqtt_shutdown()
# 	logger.info("MQTT stopped")


app = FastAPI()

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
app.include_router(minio.router)
app.include_router(pings.router)
app.include_router(probe.router)
app.include_router(zone.router)


@app.get("/")
def read_root() -> dict[str, str]:
	return {"message": "Hello World"}


@app.get("/publish")
async def publish_mqtt():
	fast_mqtt.publish("/mqtt", "Hello from FastAPI")
	logger.info("Message published to /mqtt")
	return {"message": "Published"}
