import logging
import os
import uuid
from datetime import timedelta
from functools import lru_cache

from fastapi import Depends
from fastapi.concurrency import run_in_threadpool
from minio import Minio
from minio.commonconfig import CopySource

from app.config import settings
from app.models.image import ImageCreate
from app.models.presignedurl import PresignedRequest, PresignedResponse

logger = logging.getLogger(__name__)


class StorageService:
	"""Service for handling MinIO storage operations."""

	def __init__(self, client: Minio):
		"""Initialize storage service with MinIO client.

		Args:
			client: Configured MinIO client instance.
		"""
		self.client = client
		self.temp_bucket = settings.MINIO_BUCKET_TEMP
		self.main_bucket = settings.MINIO_BUCKET_MAIN

	def check_connection(self) -> bool:
		"""Test MinIO connection status.

		Returns:
			True if connection successful, False otherwise.
		"""
		try:
			# ลอง list buckets ดู ถ้าไม่ error แปลว่า connect ได้
			self.client.list_buckets()
			return True
		except Exception as e:
			print(f"MinIO Connection Error: {e}")
			return False

	def ensure_buckets_exist(self):
		"""Verify existence of required storage buckets.

		Returns:
			Dict mapping bucket names to their status ('Exists', 'Empty', or error message).
		"""
		buckets = [self.temp_bucket, self.main_bucket]
		status = {}
		for bucket in buckets:
			try:
				if not self.client.bucket_exists(bucket):
					# self.client.make_bucket(bucket)
					status[bucket] = "Empty"
				else:
					status[bucket] = "Exists"
			except Exception as e:
				status[bucket] = f"Error: {str(e)}"
		return status

	def generate_presigned_urls(
		self, req: list[PresignedRequest]
	) -> list[PresignedResponse | None]:
		"""Generate presigned URL for file upload.

		Args:
			req: List of PresignedRequest objects containing name and type.
		Returns:
			List of dicts with 'presigned_url' and 'object_name' and 'original_name', or None if failed.

		Raises:
			ValueError: If file extension is not supported.
		"""
		result = []
		for item in req:
			try:
				ext = os.path.splitext(item.name)[1].lower()
				if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
					raise ValueError("Unsupported file extension")

				if item.type not in [
					"image/jpg",
					"image/jpeg",
					"image/png",
					"image/gif",
					"image/webp",
				]:
					raise ValueError("Unsupported file type")

				# bug in jpg compare to jpeg
				if ext == ".jpg" and item.type == "image/jpeg":
					ext = ".jpeg"
				if ext != f".{item.type.split('/')[-1]}":
					raise ValueError(
						"File extension does not match file type", ext, item.type
					)

				obj_name = f"{uuid.uuid4()}{ext}"
				# ใช้ Presigned PUT สำหรับอัปโหลด
				url = self.client.presigned_put_object(
					bucket_name=self.temp_bucket,
					object_name=obj_name,
					expires=timedelta(minutes=10),  # ลิงก์มีอายุ 10 นาที
				)
				result.append(
					PresignedResponse(
						presigned_url=url,
						object_name=obj_name,
						original_name=item.name,
					)
				)
			except Exception as e:
				logger.error(f"Error generating url for {item.name}: {e}")
				result.append(None)
		return result

	def _delete_file(self, file_path: str) -> None:
		"""Delete file from temp bucket.

		Args:
			file_path: Object path within bucket.
		"""
		try:
			self.client.remove_object(self.temp_bucket, file_path)
			print(f"Deleted file: {file_path}")
		except Exception as e:
			print(f"Error deleting file: {e}")
			# การลบไฟล์พลาด อาจจะไม่ต้อง raise error รุนแรงก็ได้ แล้วแต่ policy
			pass

	def _promote_file(self, temp_filename: str, destination_path: str) -> str:
		"""Move file from temp bucket to main storage.

		Args:
			temp_filename: UUID filename in temp bucket.
			destination_path: Target path in main bucket (e.g., 'zones/1/uuid.jpg').

		Returns:
			Final storage path.

		Raises:
			Exception: If copy or delete operation fails.
		"""
		try:
			# 1. สั่ง Copy ข้าม Bucket
			# CopySource ต้องระบุ bucket/object
			copy_source = CopySource(self.temp_bucket, temp_filename)

			self.client.copy_object(self.main_bucket, destination_path, copy_source)
			# 2. ลบไฟล์ต้นฉบับออกจาก Temp (เพราะย้ายมาแล้ว)
			self._delete_file(temp_filename)

			return destination_path

		except Exception as e:
			print(f"Error promoting file: {e}")
			# ควร raise error เพื่อให้ Router รู้ว่าย้ายไม่สำเร็จ (จะได้ Rollback DB)
			raise e

	async def upload_file(
		self,
		file_path: str,
		req: ImageCreate,
	) -> str:
		"""Upload and promote file to permanent storage.

		Args:
			file_path: Base directory path for storage.
			req: Image creation request containing filename.

		Returns:
			Final storage path of uploaded file.

		Raises:
			Exception: If promotion fails.
		"""
		try:
			# กำหนด Path ปลายทาง
			# เช่น zones/99/xxxx-xxxx.jpg
			dest_path = f"{file_path}/{req.filename}"

			# เรียกใช้ฟังก์ชัน promote ที่เพิ่งเขียน
			final_path = await run_in_threadpool(
				self._promote_file,
				temp_filename=req.filename,
				destination_path=dest_path,
			)

			return final_path
		except Exception as e:
			raise e

	def delete_file_by_url(self, file_path: str) -> None:
		"""Delete file from main storage by URL.

		Args:
			file_path: Full URL of the file to delete.
		"""
		try:
			self.client.remove_object(self.main_bucket, file_path)
			print(f"Deleted file from URL: {file_path}")
		except Exception as e:
			print(f"Error deleting file by URL: {e}")
			# การลบไฟล์พลาด อาจจะไม่ต้อง raise error รุนแรงก็ได้ แล้วแต่ policy
			raise e


@lru_cache
def get_minio_client() -> Minio:
	"""Get singleton MinIO client instance.

	Returns:
		Configured MinIO client (cached).
	"""
	client = Minio(
		endpoint=settings.MINIO_ENDPOINT,
		access_key=settings.MINIO_ACCESS_KEY,
		secret_key=settings.MINIO_SECRET_KEY,
		secure=settings.MINIO_SECURE,
	)
	return client


def get_storage_service(client: Minio = Depends(get_minio_client)) -> StorageService:
	"""FastAPI dependency for storage service injection.

	Args:
		client: MinIO client from dependency injection.

	Returns:
		Configured StorageService instance.
	"""
	return StorageService(client)
