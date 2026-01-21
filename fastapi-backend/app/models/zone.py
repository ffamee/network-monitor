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

from geoalchemy2 import Geometry
from sqlmodel import Column, Field, SQLModel


# Shared properties
class ZoneBase(SQLModel):
	name: str = Field(index=True, min_length=1, unique=True)
	description: str | None = Field(default=None)


# Properties to receive via API on creation
class ZoneCreate(ZoneBase):
	geojson: dict[str, Any]


# Properties to receive via API on update
class ZoneUpdate(ZoneCreate):
	pass


# Database table model
class Zone(ZoneBase, table=True):
	id: int | None = Field(default=None, primary_key=True)
	paths: Any = Field(sa_column=Column(Geometry("POLYGON", srid=4326)))
	# building_id: list[int] | None = Field(default=None, foreign_key="building.id")
