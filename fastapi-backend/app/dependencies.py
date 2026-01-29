from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.services.influx import InfluxService, get_influx_service
from app.services.storage import StorageService, get_storage_service

SessionDep = Annotated[AsyncSession, Depends(get_session)]

StorageDep = Annotated[StorageService, Depends(get_storage_service)]

InfluxDep = Annotated[InfluxService, Depends(get_influx_service)]
