"""Service for handling InfluxDB operations."""

import logging
from datetime import datetime
from functools import lru_cache
from typing import Any

from fastapi import Depends
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryApi

from app.config import settings

logger = logging.getLogger(__name__)


class InfluxService:
	"""Service for handling InfluxDB query operations."""

	def __init__(self, client: InfluxDBClient):
		"""Initialize InfluxDB service with client.

		Args:
			client: Configured InfluxDB client instance.
		"""
		self.client = client
		self.query_api: QueryApi = client.query_api()
		self.org = settings.INFLUXDB_ORG
		self.bucket = settings.INFLUXDB_BUCKET

	def check_connection(self) -> bool:
		"""Test InfluxDB connection status.

		Returns:
			True if connection successful, False otherwise.
		"""
		try:
			# ลอง ping หรือ query ดู ถ้าไม่ error แปลว่า connect ได้
			health = self.client.health()
			return health.status == "pass"
		except Exception as e:
			logger.error(f"InfluxDB Connection Error: {e}")
			return False

	def query_data(
		self,
		measurement: str,
		field: str | None = None,
		start_time: str | datetime = "-1h",
		stop_time: str | datetime | None = None,
		filters: dict[str, str] | None = None,
	) -> list[dict[str, Any]]:
		"""Query data from InfluxDB.

		Args:
			measurement: Measurement name to query.
			field: Specific field to query. If None, queries all fields.
			start_time: Start time for query (e.g., "-1h", "-30m", or datetime object).
			stop_time: Stop time for query. If None, uses current time.
			filters: Additional tag filters as key-value pairs.

		Returns:
			List of query results as dictionaries.

		Raises:
			Exception: If query fails.
		"""
		try:
			# สร้าง Flux query
			query = f'from(bucket: "{self.bucket}")'
			query += (
				f" |> range(start: {start_time}"
				+ (f", stop: {stop_time}" if stop_time else "")
				+ ")"
			)
			query += f' |> filter(fn: (r) => r["_measurement"] == "{measurement}")'

			# เพิ่ม field filter ถ้ามี
			if field:
				query += f' |> filter(fn: (r) => r["_field"] == "{field}")'

			# เพิ่ม tag filters ถ้ามี
			if filters:
				for key, value in filters.items():
					query += f' |> filter(fn: (r) => r["{key}"] == "{value}")'

			logger.info(f"Executing query: {query}")

			# Execute query
			tables = self.query_api.query(query, org=self.org)

			# แปลงผลลัพธ์เป็น list of dicts
			results = []
			for table in tables:
				for record in table.records:
					results.append(
						{
							"time": record.get_time(),
							"measurement": record.get_measurement(),
							"field": record.get_field(),
							"value": record.get_value(),
							**{
								k: v
								for k, v in record.values.items()
								if k.startswith("tag_") or not k.startswith("_")
							},
						}
					)

			return results
		except Exception as e:
			logger.error(f"Error querying InfluxDB: {e}")
			raise e

	def query_raw(self, flux_query: str) -> list[dict[str, Any]]:
		"""Execute raw Flux query.

		Args:
			flux_query: Raw Flux query string.

		Returns:
			List of query results as dictionaries.

		Raises:
			Exception: If query fails.
		"""
		try:
			logger.info(f"Executing raw query: {flux_query}")
			tables = self.query_api.query(flux_query, org=self.org)

			results = []
			for table in tables:
				for record in table.records:
					results.append(record.values)

			return results
		except Exception as e:
			logger.error(f"Error executing raw query: {e}")
			raise e

	def get_latest_value(
		self,
		measurement: str,
		field: str,
		filters: dict[str, str] | None = None,
	) -> dict[str, Any] | None:
		"""Get the latest value for a specific measurement and field.

		Args:
			measurement: Measurement name to query.
			field: Field name to query.
			filters: Additional tag filters as key-value pairs.

		Returns:
			Latest record as dictionary or None if no data found.
		"""
		try:
			query = f'from(bucket: "{self.bucket}")'
			query += " |> range(start: -30d)"  # Look back 30 days
			query += f' |> filter(fn: (r) => r["_measurement"] == "{measurement}")'
			query += f' |> filter(fn: (r) => r["_field"] == "{field}")'

			if filters:
				for key, value in filters.items():
					query += f' |> filter(fn: (r) => r["{key}"] == "{value}")'

			query += " |> last()"

			logger.info(f"Executing latest value query: {query}")
			tables = self.query_api.query(query, org=self.org)

			for table in tables:
				for record in table.records:
					return {
						"time": record.get_time(),
						"measurement": record.get_measurement(),
						"field": record.get_field(),
						"value": record.get_value(),
						**{
							k: v
							for k, v in record.values.items()
							if k.startswith("tag_") or not k.startswith("_")
						},
					}

			return None
		except Exception as e:
			logger.error(f"Error getting latest value: {e}")
			raise e


@lru_cache
def get_influx_client() -> InfluxDBClient:
	"""Get singleton InfluxDB client instance.

	Returns:
		Configured InfluxDB client (cached).
	"""
	client = InfluxDBClient(
		url=settings.INFLUXDB_URL,
		token=settings.INFLUXDB_TOKEN,
		org=settings.INFLUXDB_ORG,
		verify_ssl=settings.INFLUXDB_VERIFY_SSL,
		ssl_ca_cert=settings.INFLUXDB_SSL_CA_PATH,
	)
	return client


def get_influx_service(
	client: InfluxDBClient = Depends(get_influx_client),
) -> InfluxService:
	"""FastAPI dependency for InfluxDB service injection.

	Args:
		client: InfluxDB client from dependency injection.

	Returns:
		Configured InfluxService instance.
	"""
	return InfluxService(client)
