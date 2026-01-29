from typing import TYPE_CHECKING, Any

from geoalchemy2 import Geometry, WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import ConfigDict, ValidationInfo, computed_field, field_validator
from shapely.geometry import mapping
from slugify import slugify
from sqlmodel import Column, Field, Relationship, SQLModel

from app.models.building import BuildingRead, BuildingReadProbeCount
from app.models.image import ImageCreate, ImageDelete, ImageRead
from app.models.probe import ProbeReadMap
from app.models.shared import SummaryBase

if TYPE_CHECKING:
	from .building import Building
	from .image import ZoneImage


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
	images: list["ImageCreate"] | None = Field(default=None)


# Properties to receive via API on update
class ZoneUpdate(ZoneCreate):
	deleted_images: list["ImageDelete"] | None = Field(
		default=None, validation_alias="deletedImages"
	)


# Database table model
class Zone(ZoneBase, table=True):
	id: int | None = Field(default=None, primary_key=True)
	paths: Any | None = Field(
		default=None,
		sa_column=Column(Geometry("MULTIPOLYGON", srid=4326)),
	)
	images: list["ZoneImage"] | None = Relationship(
		back_populates="zone", cascade_delete=True
	)
	buildings: list["Building"] | None = Relationship(
		back_populates="zone", cascade_delete=True
	)
	# building_id: list[int] | None = Field(default=None, foreign_key="building.id")


# Properties to return via API
class ZoneRead(ZoneBase):
	id: int
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

	images: list["ImageRead"] | None = Field(default=None)


class ZoneReadSummary(SummaryBase):
	pass


class ZoneReadBuildingSummary(ZoneReadSummary):
	buildings: list[SummaryBase]


class ZoneReadBuilding(ZoneRead):
	buildings: list["BuildingRead"]


class ZoneReadProbeCount(ZoneRead):
	buildings: list["BuildingReadProbeCount"]


class ZoneReadMap(ZoneRead):
	probes: list["ProbeReadMap"] = Field(validation_alias="buildings")

	@field_validator("probes", mode="before", check_fields=False)
	@classmethod
	def extract_probes(cls, v: Any, info: "ValidationInfo") -> list["ProbeReadMap"]:
		if isinstance(v, list):
			probes_list = []
			for building in v:
				if hasattr(building, "probes") and building.probes:
					for probe in building.probes:
						probes_list.append(
							ProbeReadMap(**probe.model_dump(), building=building)
						)
			return probes_list
		raise ValueError("Invalid buildings data")

	building_count: int = Field(
		validation_alias="buildings", serialization_alias="buildingCount"
	)

	@field_validator("building_count", mode="before", check_fields=False)
	@classmethod
	def count_buildings(cls, v: Any, info: "ValidationInfo") -> int:
		if v is None:
			return 0
		if isinstance(v, list):
			return len(v)
		raise ValueError("Invalid buildings data")
