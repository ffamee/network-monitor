from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from geoalchemy2 import Geometry, WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import (
	ConfigDict,
	ValidationInfo,
	computed_field,
	field_serializer,
	field_validator,
)
from pydantic_extra_types.coordinate import Latitude, Longitude
from slugify import slugify
from sqlalchemy.dialects.postgresql import INET, MACADDR
from sqlmodel import TIMESTAMP, Column, Field, Relationship, SQLModel, UniqueConstraint

from app.models.image import ImageCreate, ImageDelete, ImageRead
from app.models.shared import ObjectRelation

if TYPE_CHECKING:
	from .building import Building
	from .image import ProbeImage


# Shared properties
class ProbeBase(SQLModel):
	name: str = Field(index=True, min_length=1)
	floor: int | None = Field(default=None)
	description: str | None = Field(default=None)
	address: str | None = Field(default=None, nullable=True)
	# status: str = Field(default="inactive")  # 'active' or 'inactive'
	model_config = ConfigDict(
		from_attributes=True,
	)


# Properties to receive via API on creation
class ProbeCreate(ProbeBase):
	lat: Latitude
	lng: Longitude
	serial_number: str = Field(
		index=True, min_length=1, unique=True, validation_alias="serialNumber"
	)
	google_place_id: str | None = Field(
		default=None, index=True, validation_alias="placeId"
	)
	building_id: int = Field(validation_alias="buildingId")
	images: list["ImageCreate"] | None = Field(default=None)


# Properties to receive via API on update
class ProbeUpdate(ProbeCreate):
	deleted_images: list["ImageDelete"] | None = Field(
		default=None, validation_alias="deletedImages"
	)


# Database table model
class Probe(ProbeBase, table=True):
	# Unique: (name, building_id) at DB level
	__table_args__ = (
		UniqueConstraint("name", "building_id", name="uq_probe_name_building"),
	)

	id: int | None = Field(default=None, primary_key=True)
	ip_address: str | None = Field(default=None, sa_column=Column(INET))
	mac_address: Any | None = Field(default=None, sa_column=Column(MACADDR))
	serial_number: str = Field(index=True, unique=True, min_length=1)
	google_place_id: str | None = Field(default=None, index=True)
	location: Any = Field(
		sa_column=Column(Geometry("POINT", srid=4326)),
	)
	images: list["ProbeImage"] | None = Relationship(
		back_populates="probe", cascade_delete=True
	)
	building_id: int = Field(foreign_key="building.id", index=True, ondelete="CASCADE")
	building: "Building" = Relationship(back_populates="probes")
	created_at: datetime | None = Field(
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


class ProbeRead(ProbeBase):
	id: int
	google_place_id: str | None = Field(
		default=None, serialization_alias="googlePlaceId"
	)
	serial_number: str = Field(serialization_alias="serialNumber")
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
		"""Generate a URL-friendly slug from the probe id and name."""
		return f"{self.id}-{slugify(self.name)}"

	images: list["ImageRead"] | None = Field(default=None)


class ProbeReadRelation(ProbeRead):
	building: ObjectRelation
	zone: ObjectRelation = Field(validation_alias="building")

	@field_validator("zone", mode="before", check_fields=False)
	@classmethod
	def extract_zone(cls, v: Any, info: "ValidationInfo") -> ObjectRelation:
		from app.models.building import Building

		if isinstance(v, Building):
			zone = v.zone
			return ObjectRelation(id=zone.id, name=zone.name)
		raise ValueError("Invalid building data")


class ProbeReadDetail(ProbeRead):
	ip_address: str | None = Field(default=None, serialization_alias="ipAddress")

	# serialize ip_address as string from INET type
	@field_serializer("ip_address", mode="plain")
	def serialize_ip_address(self, v: Any) -> str | None:
		if v is None:
			return None
		return str(v)

	mac_address: str | None = Field(default=None, serialization_alias="macAddress")

	# serialize mac_address as string from MACADDR type
	@field_serializer("mac_address", mode="plain")
	def serialize_mac_address(self, v: Any) -> str | None:
		if v is None:
			return None
		return str(v)

	created_at: datetime = Field(serialization_alias="createdAt")
	updated_at: datetime = Field(serialization_alias="updatedAt")


class ProbeReadTable(ProbeRead):
	ip_address: str | None = Field(default=None, serialization_alias="ipAddress")
	created_at: datetime = Field(serialization_alias="createdAt")
	updated_at: datetime = Field(serialization_alias="updatedAt")


class ProbeReadMap(ProbeRead):
	ip_address: str | None = Field(default=None, serialization_alias="ipAddress")
	building: ObjectRelation
