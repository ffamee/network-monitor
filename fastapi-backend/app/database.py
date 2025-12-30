from typing import AsyncGenerator
from sqlmodel import create_engine
from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

database_url = str(settings.SQLALCHEMY_DATABASE_URI)
engine = create_engine(database_url, echo=True)

async_session_maker = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
