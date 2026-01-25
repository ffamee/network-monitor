import os
import uuid
from datetime import timedelta
from functools import lru_cache

from fastapi import Depends
from minio import Minio
from minio.commonconfig import CopySource

from app.config import settings
from app.models.image import ImageRequest


# 1. สร้าง Class Service เพื่อห่อหุ้ม Logic (ตามที่เราคุยกัน)
# Class นี้จะทำหน้าที่รับ Client เข้ามา แล้วมี method ต่างๆ ให้เรียกใช้
class StorageService:
	def __init__(self, client: Minio):
		self.client = client
		self.temp_bucket = settings.MINIO_BUCKET_TEMP
		self.main_bucket = settings.MINIO_BUCKET_MAIN

	def check_connection(self) -> bool:
		"""ฟังก์ชันทดสอบว่าเชื่อมต่อได้ไหม (เอาไว้เช็คเล่นๆ ก่อน)"""
		try:
			# ลอง list buckets ดู ถ้าไม่ error แปลว่า connect ได้
			self.client.list_buckets()
			return True
		except Exception as e:
			print(f"MinIO Connection Error: {e}")
			return False

	def ensure_buckets_exist(self):
		"""เช็คว่า Bucket มีครบไหม ถ้าไม่มีให้สร้างเลย (Init)"""
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

	def generate_presigned_url(self, filename: str) -> dict | None:
		"""สร้าง Presigned URL สำหรับการอัปโหลด (PUT Method)"""
		try:
			ext = os.path.splitext(filename)[1].lower()
			if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
				raise ValueError("Unsupported file extension")

			obj_name = f"{uuid.uuid4()}{ext}"
			# ใช้ Presigned PUT สำหรับอัปโหลด
			url = self.client.presigned_put_object(
				bucket_name=self.temp_bucket,
				object_name=obj_name,
				expires=timedelta(minutes=10),  # ลิงก์มีอายุ 10 นาที
			)
			return {
				"presigned_url": url,
				"object_name": obj_name,
			}
		except Exception as e:
			print(f"Error generating url: {e}")
			return None

	def _delete_file(self, bucket: str, file_path: str) -> None:
		"""
		ลบไฟล์ออกจาก Main Storage (ใช้ตอน User ลบรูป หรือ ลบ Zone)
		"""
		try:
			self.client.remove_object(bucket, file_path)
			print(f"Deleted file: {file_path}")
		except Exception as e:
			print(f"Error deleting file: {e}")
			# การลบไฟล์พลาด อาจจะไม่ต้อง raise error รุนแรงก็ได้ แล้วแต่ policy
			pass

	def _promote_file(self, temp_filename: str, destination_path: str) -> str:
		"""
		ย้ายไฟล์จาก Temp Bucket -> Main Storage Bucket
		params:
			- temp_filename: ชื่อไฟล์ UUID ที่อยู่ใน Temp (ได้จาก frontend ตอน submit)
			- destination_path: path ปลายทางที่ต้องการจัดเก็บ เช่น "zones/1/image.jpg"
		"""
		try:
			# 1. สั่ง Copy ข้าม Bucket
			# CopySource ต้องระบุ bucket/object
			copy_source = CopySource(self.temp_bucket, temp_filename)

			self.client.copy_object(self.main_bucket, destination_path, copy_source)
			# 2. ลบไฟล์ต้นฉบับออกจาก Temp (เพราะย้ายมาแล้ว)
			self._delete_file(self.temp_bucket, temp_filename)

			return destination_path

		except Exception as e:
			print(f"Error promoting file: {e}")
			# ควร raise error เพื่อให้ Router รู้ว่าย้ายไม่สำเร็จ (จะได้ Rollback DB)
			raise e

	def upload_file(
		self,
		file_path: str,
		req: ImageRequest,
	):
		try:
			# กำหนด Path ปลายทาง
			# เช่น zones/99/xxxx-xxxx.jpg
			dest_path = f"{file_path}/{req.filename}"

			# เรียกใช้ฟังก์ชัน promote ที่เพิ่งเขียน
			final_path = self._promote_file(
				temp_filename=req.filename, destination_path=dest_path
			)

			return {
				"status": "success",
				"message": "File moved to permanent storage",
				"final_path_in_db": final_path,
			}
		except Exception as e:
			return {"status": "error", "message": str(e)}


# 2. สร้าง Client แบบ Singleton ด้วย @lru_cache
# lru_cache() จะทำให้ฟังก์ชันนี้รันแค่ครั้งเดียว แล้วจำผลลัพธ์ไว้ตลอด
# ครั้งต่อไปที่เรียก มันจะส่งตัวเดิมกลับมา (ไม่สร้างใหม่)
@lru_cache
def get_minio_client() -> Minio:
	client = Minio(
		endpoint=settings.MINIO_ENDPOINT,
		access_key=settings.MINIO_ACCESS_KEY,
		secret_key=settings.MINIO_SECRET_KEY,
		secure=settings.MINIO_SECURE,
	)
	return client


# 3. สร้าง Dependency Injection สำหรับ FastAPI
# อันนี้คือตัวที่เราจะเอาไปใส่ใน Router (Depends(...))
def get_storage_service(client: Minio = Depends(get_minio_client)) -> StorageService:
	return StorageService(client)
