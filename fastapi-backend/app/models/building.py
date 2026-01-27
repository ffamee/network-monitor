# Building model
from typing import TYPE_CHECKING, Any

from geoalchemy2 import Geometry, WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import (
	ConfigDict,
	ValidationInfo,
	computed_field,
	field_validator,
)
from pydantic_extra_types.coordinate import Latitude, Longitude
from slugify import slugify
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.models.image import ImageCreate, ImageDelete, ImageRead
from app.models.zone import Zone, ZoneRelation

if TYPE_CHECKING:
	from .image import BuildingImage
	from .zone import Zone


# Shared properties
class BuildingBase(SQLModel):
	name: str = Field(index=True, min_length=1, unique=True)
	floor: int | None = Field(default=None, nullable=True)
	admin: str | None = Field(default=None, nullable=True)
	tel: str | None = Field(default=None, nullable=True)
	address: str | None = Field(default=None, nullable=True)
	model_config = ConfigDict(
		from_attributes=True,
	)


# Properties to receive via API on creation
class BuildingCreate(BuildingBase):
	google_place_id: str | None = Field(
		default=None, index=True, unique=True, validation_alias="googlePlaceId"
	)
	lat: Latitude
	lng: Longitude
	images: list["ImageCreate"] | None = Field(default=None)
	zone_id: int = Field(validation_alias="zoneId")


# Properties to receive via API on update
class BuildingUpdate(BuildingCreate):
	deleted_images: list["ImageDelete"] | None = Field(
		default=None, validation_alias="deletedImages"
	)


# Database table model
class Building(BuildingBase, table=True):
	id: int | None = Field(default=None, primary_key=True)
	google_place_id: str | None = Field(default=None, index=True, unique=True)
	location: Any = Field(
		sa_column=Column(Geometry("POINT", srid=4326)),
	)
	images: list["BuildingImage"] | None = Relationship(
		back_populates="building", cascade_delete=True
	)
	zone_id: int = Field(foreign_key="zone.id", index=True, ondelete="CASCADE")
	zone: "Zone" = Relationship(back_populates="buildings")


class BuildingRead(BuildingBase):
	id: int
	google_place_id: str | None = Field(default=None, alias="googlePlaceId")
	lat: Latitude | None = Field(default=None, validation_alias="location")
	lng: Longitude | None = Field(default=None, validation_alias="location")

	@field_validator("lat", "lng", mode="before", check_fields=False)
	@classmethod
	def extract_coordinates(
		cls, v: Any, info: "ValidationInfo"
	) -> Latitude | Longitude:
		if isinstance(v, (WKBElement, WKTElement)):
			point = to_shape(v)
			if info.field_name == "lat":
				return Latitude(point.y)
			elif info.field_name == "lng":
				return Longitude(point.x)
		raise ValueError("Invalid geometry data")

	@computed_field
	@property
	def slug(self) -> str:
		"""Generate a URL-friendly slug from the building id and name."""
		return f"{self.id}-{slugify(self.name)}"

	images: list["ImageRead"] | None = Field(default=None)


class BuildingReadRelation(BuildingRead):
	zone: ZoneRelation
