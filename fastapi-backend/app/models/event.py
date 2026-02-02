import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import ConfigDict
from sqlmodel import TIMESTAMP, Field, Relationship, SQLModel

if TYPE_CHECKING:
	from .probe import Probe


class EventBase(SQLModel):
	name: str = Field(index=True)
	severity: str
	description: str | None = None
	status: str = "firing"  # firing or resolved
	fingerprint: str | None = Field(default=None)
	silence_url: str | None = Field(default=None)
	started_at: datetime | None = Field(
		default=None,
		sa_type=TIMESTAMP(timezone=True),
	)
	resolved_at: datetime | None = Field(
		default=None,
		sa_type=TIMESTAMP(timezone=True),
	)
	model_config = ConfigDict(
		from_attributes=True,
	)


class Event(EventBase, table=True):
	id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
	probe_id: int = Field(foreign_key="probe.id", index=True, ondelete="CASCADE")
	probe: "Probe" = Relationship(back_populates="events")


class EventRead(EventBase):
	id: uuid.UUID
