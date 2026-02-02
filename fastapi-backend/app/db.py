from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import create_engine

from app.config import settings

DATABASE_URL = str(settings.SQLALCHEMY_DATABASE_URI)
SYNC_DATABASE_URL = str(settings.SQLALCHEMY_DATABASE_URI_SYNC)
engine = create_engine(SYNC_DATABASE_URL, echo=True)
# engine = create_async_engine(DATABASE_URL, echo=True)
async_engine = create_async_engine(DATABASE_URL, echo=True)


# async_session_maker = sessionmaker(
# 	bind=async_engine, class_=AsyncSession, expire_on_commit=False
# )
async_session_maker = async_sessionmaker(async_engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession]:
	async with async_session_maker() as session:
		yield session
