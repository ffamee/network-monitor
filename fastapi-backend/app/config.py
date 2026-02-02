import secrets
import warnings
from typing import Annotated, Any, Literal, Self
from urllib.parse import quote_plus

from pydantic import (
	AnyUrl,
	BeforeValidator,
	PostgresDsn,
	computed_field,
	model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str] | str:
	if isinstance(v, str) and not v.startswith("["):
		return [i.strip() for i in v.split(",") if i.strip()]
	elif isinstance(v, list | str):
		return v
	raise ValueError(v)


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=".env",
		env_ignore_empty=True,
		extra="ignore",
	)
	# API_V1_STR: str = "/api/v1"
	SECRET_KEY: str = secrets.token_urlsafe(32)
	# 60 minutes * 24 hours * 8 days = 8 days
	# ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
	FRONTEND_URL: str
	ENVIRONMENT: Literal["local", "staging", "production"] = "local"

	BACKEND_CORS_ORIGINS: Annotated[
		list[AnyUrl] | str, BeforeValidator(parse_cors)
	] = []

	@computed_field  # type: ignore[prop-decorator]
	@property
	def all_cors_origins(self) -> list[str]:
		return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
			self.FRONTEND_URL
		]

	# PROJECT_NAME: str
	# SENTRY_DSN: HttpUrl | None = None
	POSTGRES_HOST: str
	POSTGRES_PORT: int = 5432
	POSTGRES_USER: str
	POSTGRES_PASSWORD: str = ""
	POSTGRES_DB: str = ""

	@computed_field  # type: ignore[prop-decorator]
	@property
	def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
		return PostgresDsn.build(
			scheme="postgresql+asyncpg",
			username=self.POSTGRES_USER,
			password=quote_plus(self.POSTGRES_PASSWORD),
			host=self.POSTGRES_HOST,
			port=self.POSTGRES_PORT,
			path=self.POSTGRES_DB,
		)

	@computed_field  # type: ignore[prop-decorator]
	@property
	def SQLALCHEMY_DATABASE_URI_SYNC(self) -> PostgresDsn:
		return PostgresDsn.build(
			scheme="postgresql",
			username=self.POSTGRES_USER,
			password=quote_plus(self.POSTGRES_PASSWORD),
			host=self.POSTGRES_HOST,
			port=self.POSTGRES_PORT,
			path=self.POSTGRES_DB,
		)

	def _check_default_secret(self, var_name: str, value: str | None) -> None:
		if value == "changethis":
			message = (
				f'The value of {var_name} is "changethis", '
				"for security, please change it, at least for deployments."
			)
			if self.ENVIRONMENT == "local":
				warnings.warn(message, stacklevel=1)
			else:
				raise ValueError(message)

	@model_validator(mode="after")
	def _enforce_non_default_secrets(self) -> Self:
		self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
		self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)

		return self

	MINIO_ENDPOINT: str = "localhost:9000"  # ถ้า run docker ให้ใช้ "minio:9000" หรือ "localhost:9000" แล้วแต่ว่ารันจากไหน
	MINIO_ACCESS_KEY: str
	MINIO_SECRET_KEY: str
	MINIO_SECURE: bool = False  # False = HTTP (localhost), True = HTTPS (Production)
	MINIO_BUCKET_TEMP: str = "app-temp"
	MINIO_BUCKET_MAIN: str = "app-storage"

	# InfluxDB Settings
	INFLUXDB_URL: str = "https://localhost:8086"
	INFLUXDB_TOKEN: str
	INFLUXDB_ORG: str
	INFLUXDB_BUCKET: str
	INFLUXDB_VERIFY_SSL: bool = False
	INFLUXDB_SSL_CA_PATH: str

	# MQTT Settings
	MQTT_HOST: str = "localhost"
	MQTT_PORT: int = 1883
	MQTT_USERNAME: str | None = None
	MQTT_PASSWORD: str | None = None
	MQTT_KEEPALIVE: int = 60

	# Redis Settings
	REDIS_HOST: str = "localhost"
	REDIS_PORT: int = 6379
	REDIS_DB: int = 0
	REDIS_PASSWORD: str | None = None


settings = Settings()  # type: ignore
