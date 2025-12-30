from fastapi import APIRouter

router = APIRouter(
    prefix="/pings",
    tags=["pings"],
)


@router.get("/")
async def ping() -> dict[str, str]:
    return {"message": "pong"}
