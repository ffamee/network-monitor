import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlmodel import TIMESTAMP, Field, Relationship, SQLModel

if TYPE_CHECKING:
	from .zone import Zone


# Shared properties
class ImageBase(SQLModel):
	"""Base model for all image types (Zone images, Building images, etc.)"""

	url: str = Field(index=True, unique=True, nullable=False)
	created_at: datetime = Field(
		default_factory=lambda: datetime.now(UTC),
		sa_type=TIMESTAMP(timezone=True),
		nullable=False,
	)
	updated_at: datetime | None = Field(
		default_factory=lambda: datetime.now(UTC),
		sa_type=TIMESTAMP(timezone=True),
		nullable=False,
		sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
	)
	model_config = ConfigDict(
		from_attributes=True,
	)


# Properties to receive via API on creation
class ImageCreate(ImageBase):
	pass


# Properties to receive via API on update
class ImageUpdate(ImageBase):
	pass


# Database table model for ZoneImage
class ZoneImage(ImageBase, table=True):
	__tablename__ = "zone_images"

	id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
	zone_id: int = Field(foreign_key="zone.id", index=True, ondelete="CASCADE")
	zone: "Zone" = Relationship(back_populates="images")
