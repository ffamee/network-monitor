from fastapi import APIRouter

from app.dependencies import StorageDep
from app.models.presignedurl import PresignedRequest, PresignedResponse

router = APIRouter(
	prefix="/minio",
	tags=["minio"],
)


@router.get("/test-minio")
def minio_connection(storage: StorageDep):
	is_connected = storage.check_connection()
	if is_connected:
		return {"status": "ok", "message": "Connected to MinIO successfully!"}
	else:
		return {"status": "error", "message": "Failed to connect to MinIO"}


@router.get("/check-bucket")
def check_bucket(storage: StorageDep):
	exists = storage.ensure_buckets_exist()
	res = {}
	for bucket_name, is_exist in exists.items():
		if is_exist:
			res[bucket_name] = {
				"status": "ok",
				"message": f"Bucket '{bucket_name}' exists.",
			}
		else:
			res[bucket_name] = {
				"status": "error",
				"message": f"Bucket '{bucket_name}' does not exist.",
			}
	return res


@router.post("/get-presigned-urls")
def get_presigned_url(
	storage: StorageDep,
	req: list[PresignedRequest],
) -> list[PresignedResponse | None]:
	url = storage.generate_presigned_urls(req)
	if url:
		return url
	else:
		raise Exception("Failed to generate presigned URLs")
