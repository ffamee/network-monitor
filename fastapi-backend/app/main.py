from fastapi import FastAPI

from app.routers import building, pings

app = FastAPI()

app.include_router(pings.router)
app.include_router(building.router)


@app.get("/")
def read_root() -> dict[str, str]:
	return {"message": "Hello World"}
