from fastapi import APIRouter

router = APIRouter(
    prefix="/pings",
    tags=["pings"],
)


@router.get("/")
async def ping():
    return {"message": "pong"}
