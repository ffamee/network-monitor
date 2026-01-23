# Zone model
"""
full model
id: int
name: str
description: str | None
paths: (polygon geojson)
building_id: int[] (foreign key to building) # not yet implemented
"""

from typing import Any

from geoalchemy2 import Geometry, WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import ConfigDict, ValidationInfo, computed_field, field_validator
from shapely.geometry import mapping
from slugify import slugify
from sqlmodel import Column, Field, SQLModel


# Shared properties
class ZoneBase(SQLModel):
	name: str = Field(index=True, min_length=1, unique=True)
	description: str | None = Field(default=None)
	color: str = Field(default="#000000")
	model_config = ConfigDict(
		from_attributes=True,
	)


# Properties to receive via API on creation
class ZoneCreate(ZoneBase):
	geojson: dict[str, Any] | None = Field(default=None)


# Properties to receive via API on update
class ZoneUpdate(ZoneCreate):
	pass


# Database table model
class Zone(ZoneBase, table=True):
	id: int | None = Field(default=None, primary_key=True)
	paths: Any | None = Field(
		default=None,
		sa_column=Column(Geometry("MULTIPOLYGON", srid=4326)),
	)
	# building_id: list[int] | None = Field(default=None, foreign_key="building.id")


# Properties to return via API
class ZoneRead(ZoneBase):
	id: int
	# geojson: dict[str, Any] | None = Field(default=None, validation_alias="paths")
	# geojson: dict[str, Any] | None = Field(default=None, serialization_alias="paths")
	geojson: dict[str, Any] | None = Field(
		default=None,
		validation_alias="paths",
	)

	@field_validator("geojson", mode="before", check_fields=False)
	@classmethod
	def convert_geometry(cls, v: Any, info: ValidationInfo) -> dict[str, Any] | None:
		if v is None:
			return None
		if isinstance(v, (WKBElement, WKTElement)) or hasattr(v, "geom_type"):
			return mapping(to_shape(v))

		if isinstance(v, dict):
			return v

		raise ValueError("Invalid geometry data")

	@computed_field
	@property
	def slug(self) -> str:
		"""Generate a URL-friendly slug from the zone id and name."""
		return f"{self.id}-{slugify(self.name)}"
