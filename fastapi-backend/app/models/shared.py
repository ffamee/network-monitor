from pydantic import computed_field
from slugify import slugify
from sqlmodel import Field, SQLModel


class ObjectRelation(SQLModel):
	id: int
	name: str = Field(exclude=True)

	@computed_field
	@property
	def slug(self) -> str:
		"""Generate a URL-friendly slug from the zone id and name."""
		return f"{self.id}-{slugify(self.name)}"
