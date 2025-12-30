# Building model
from sqlmodel import Field, SQLModel


# Shared properties
class BuildingBase(SQLModel):
    name: str
    lat: float
    lon: float


# Properties to receive via API on creation
class BuildingCreate(BuildingBase):
    google_place_id: str | None = Field(default=None)
    description: str | None = Field(default=None)


# Properties to receive via API on update
class BuildingUpdate(BuildingBase):
    google_place_id: str | None = Field(default=None)
    description: str | None = Field(default=None)


# Database table model
class Building(BuildingBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    google_place_id: str | None = Field(default=None, index=True, unique=True)
    description: str | None = Field(default=None)
