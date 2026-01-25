from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.services.storage import StorageService, get_storage_service

SessionDep = Annotated[AsyncSession, Depends(get_session)]

StorageDep = Annotated[StorageService, Depends(get_storage_service)]
