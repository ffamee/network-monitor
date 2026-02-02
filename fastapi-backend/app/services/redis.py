"""Service for handling Redis operations."""

import logging
import time
from contextlib import asynccontextmanager

from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

# Global Redis client instance
_redis_client: Redis | None = None


class RedisService:
	"""Lightweight wrapper for Redis client with connection checking and logging."""

	def __init__(self, client: Redis):
		"""Initialize Redis service with client.

		Args:
			client: Configured Redis client instance.
		"""
		self.client = client
		# timeout for heartbeat operations
		self.timeout = 180  # seconds

	async def check_connection(self) -> bool:
		"""Test Redis connection status.

		Returns:
			True if connection successful, False otherwise.
		"""
		try:
			await self.client.ping()
			logger.info("Redis connection successful")
			return True
		except Exception as e:
			logger.error(f"Redis Connection Error: {e}")
			return False

	# specifi Redis operations for heartbeat
	# ---------------------------------------------------------

	async def _cleanup(self, group_key: str):
		"""Cleanup old/expired members from the heartbeat group."""
		min_score = time.time() - self.timeout

		start_time_key = f"{group_key}:start_times"
		# ลบสมาชิกที่หมดอายุออกจาก Set
		dead_members = await self.client.zrangebyscore(group_key, 0, min_score)
		if dead_members:
			# ลบ start times ของสมาชิกที่หมดอายุ
			await self.client.hdel(start_time_key, *dead_members)
		await self.client.zremrangebyscore(group_key, 0, min_score)

	# ---------------------------------------------------------
	# 1. Update Heartbeat
	# ---------------------------------------------------------
	async def update_heartbeat(self, group_key: str, member_id: str):
		"""
		อัปเดตสถานะว่า device นี้ยังอยู่นะ (พร้อมเคลียร์คนเก่า)
		เช่น: group_key="zone:1", member_id="device:101"
		"""
		# เคลียร์คนหมดอายุก่อน (ตามที่รีเควส)
		await self._cleanup(group_key)

		start_time_key = f"{group_key}:start_times"
		score = await self.client.zscore(group_key, member_id)

		if score is None:
			# Scenario: มาใหม่ หรือ หลุดไปแล้วกลับมาใหม่ (Reconnect)
			# ให้เซฟเวลาเริ่มต้น (Start Time)
			await self.client.hset(start_time_key, member_id, time.time())
		# บันทึก/อัปเดต timestamp ปัจจุบัน (ใช้ time.time())
		await self.client.zadd(group_key, {member_id: time.time()})

	# ---------------------------------------------------------
	# 2. Get Active Count
	# ---------------------------------------------------------
	async def get_active_count(self, group_key: str) -> int:
		"""
		นับจำนวนคนที่ online จริงๆ (เคลียร์คนเก่าทิ้งก่อนนับ)
		"""
		await self._cleanup(group_key)

		# คืนค่าจำนวนสมาชิกที่เหลือใน Set (เร็วมาก O(1))
		return await self.client.zcard(group_key)

	# ---------------------------------------------------------
	# 3. Check is Online
	# ---------------------------------------------------------
	async def check_is_online(self, group_key: str, member_id: str) -> bool:
		"""
		เช็คเจาะจงว่า device นี้ online อยู่ไหม
		"""
		await self._cleanup(group_key)

		# ดึง Score ออกมา ถ้ามีค่าแสดงว่าอยู่ใน Set (คือ Online)
		score = await self.client.zscore(group_key, member_id)
		return score is not None

	# ---------------------------------------------------------
	# 4. Get Start Time
	# ---------------------------------------------------------
	async def get_uptime(self, group_key: str, member_id: str) -> float:
		"""
		คำนวณว่า Online มานานกี่วินาทีแล้ว (คืนค่า 0 ถ้าหาไม่เจอ)
		"""
		await self._cleanup(group_key)

		# เช็คก่อนว่ายัง Online อยู่ไหม
		is_online = await self.client.zscore(group_key, member_id)
		if not is_online:
			return 0.0

		# ดึงเวลาเริ่มต้นออกมา
		start_time_key = f"{group_key}:start_times"
		start_ts_str = await self.client.hget(start_time_key, member_id)

		if start_ts_str:
			start_ts = float(start_ts_str)
			duration = time.time() - start_ts
			return duration

		return 0.0  # กรณี Error (มีใน ZSET แต่ไม่มีใน HASH)


def create_redis_client() -> Redis:
	"""Create a new Redis client instance.

	Returns:
		Configured Redis client.
	"""
	client = Redis(
		host=settings.REDIS_HOST,
		port=settings.REDIS_PORT,
		db=settings.REDIS_DB,
		password=settings.REDIS_PASSWORD,
		decode_responses=False,
	)
	return client


@asynccontextmanager
async def lifespan_redis():
	"""Lifespan context manager for Redis client.

	Usage in main.py:
		lifespan = lifespan_redis()
		app = FastAPI(lifespan=lifespan)
	"""
	global _redis_client

	# Startup
	logger.info("Initializing Redis client...")
	_redis_client = create_redis_client()
	service = RedisService(_redis_client)

	if await service.check_connection():
		logger.info("✓ Redis connected successfully")
	else:
		logger.warning("⚠ Redis connection failed - service may not be available")

	yield

	# Shutdown
	logger.info("Closing Redis client...")
	if _redis_client:
		await _redis_client.aclose()
		logger.info("✓ Redis client closed")


def get_redis_client() -> Redis:
	"""Get the global Redis client instance.

	Returns:
		Configured Redis client (singleton).

	Raises:
		RuntimeError: If Redis client not initialized via lifespan.
	"""
	if _redis_client is None:
		raise RuntimeError(
			"Redis client not initialized. Ensure lifespan is set in FastAPI app."
		)
	return _redis_client


def get_redis_service() -> RedisService:
	"""Get Redis service instance with global client.

	Returns:
		Configured RedisService instance.
	"""
	client = get_redis_client()
	return RedisService(client)
