# Building model
from pydantic_extra_types.coordinate import Latitude, Longitude
from sqlmodel import Field, SQLModel


# Shared properties
class BuildingBase(SQLModel):
	name: str = Field(index=True, min_length=1, unique=True)
	lat: Latitude
	lon: Longitude


# Properties to receive via API on creation
class BuildingCreate(BuildingBase):
	google_place_id: str | None = Field(default=None, index=True, unique=True)
	description: str | None = Field(default=None)


# Properties to receive via API on update
class BuildingUpdate(SQLModel):
	name: str | None = Field(default=None, min_length=1)
	lat: Latitude | None = None
	lon: Longitude | None = None
	google_place_id: str | None = None
	description: str | None = None


# Database table model
# class Building(BuildingCreate, table=True):
class Building(BuildingCreate):
	id: int | None = Field(default=None, primary_key=True)
