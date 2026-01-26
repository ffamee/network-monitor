from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class PresignedRequest(SQLModel):
	"""Model for presigned URL responses."""

	name: str
	type: str


class PresignedResponse(SQLModel):
	"""Model for presigned URL responses."""

	presigned_url: str = Field(alias="url")
	object_name: str = Field(alias="key")
	original_name: str = Field(alias="originalName")
	model_config = ConfigDict(
		populate_by_name=True,
	)
