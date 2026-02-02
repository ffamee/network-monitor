"""Service for handling Redis operations."""

import logging
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.config import settings
from app.models.event import Event

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

	async def cleanup(self, session: AsyncSession) -> None:
		"""Cleanup old/expired members from the heartbeat group."""
		min_score = time.time() - self.timeout

		# 1. วนลูปหา Key ทั้งหมดที่ขึ้นต้นด้วย probe:status:
		# การใช้ scan_iter ปลอดภัยต่อ Production (ไม่ทำให้ Redis ค้างเหมือนคำสั่ง KEYS)
		async for group_key in self.client.scan_iter(match="probe:status:*"):
			# ⚠️ สำคัญ: กรอง Key ที่ไม่ใช่อันหลักออก
			# ถ้า key ลงท้ายด้วย :start_times ให้ข้ามไปเลย
			# (เพราะเดี๋ยวเราจะจัดการมันผ่าน key หลักเอง)
			group_key = group_key.decode("utf-8")
			if group_key.endswith(":start_times"):
				continue

			# --------------------------------------------------
			# ณ จุดนี้ group_key คือ "probe:status:{zone}:{building}" แน่นอน
			# --------------------------------------------------

			# 2. หาคนตายใน Group นี้ (Probe ID ที่ score เก่ากว่ากำหนด)
			dead_members = await self.client.zrangebyscore(group_key, 0, min_score)

			if not dead_members:
				continue  # ถ้าทุกคนยังอยู่ดี ก็ข้ามไป

			print(f"Cleanup group {group_key}: Found dead probes {dead_members}")

			# 3. ลบข้อมูลใน Redis
			# ต้องลบออกจาก hash :start_times ด้วย
			start_time_key = f"{group_key}:start_times"

			# ลบ start time ของ probe ที่ตาย
			if dead_members:
				await self.client.hdel(start_time_key, *dead_members)

			# ลบออกจาก ZSET หลัก
			await self.client.zremrangebyscore(group_key, 0, min_score)

			# 4. แปลงข้อมูลเตรียมลง DB
			# dead_members คือ list ของ probe_id (string)
			dead_probe_ids = [int(mid) for mid in dead_members]

			# อัปเดตสถานะ probe ใน DB เป็น offline
			for probe_id in dead_probe_ids:
				# เช็คว่ามี event offline อยู่หรือยัง
				statement = select(Event).where(
					Event.probe_id == probe_id,
					Event.name == "Probe Offline",
					Event.status == "firing",
					Event.resolved_at.is_(None),
				)
				result = await session.execute(statement)
				event = result.scalars().one_or_none()
				if event:
					continue  # มีอยู่แล้ว ข้ามไป
				new_event = Event(
					name="Probe Offline",
					severity="critical",
					description=f"Probe ID {probe_id} went offline due to heartbeat timeout.",
					status="firing",
					fingerprint=f"probe-offline-{probe_id}",
					started_at=datetime.now(UTC),
					probe_id=probe_id,
				)
				session.add(new_event)
			await session.commit()

	# ---------------------------------------------------------
	# 1. Update Heartbeat
	# ---------------------------------------------------------
	async def update_heartbeat(
		self, session: AsyncSession, group_key: str, member_id: str
	):
		"""
		อัปเดตสถานะว่า device นี้ยังอยู่นะ (พร้อมเคลียร์คนเก่า)
		เช่น: group_key="probe:status:1:1", member_id="3"
		"""

		start_time_key = f"{group_key}:start_times"
		score = await self.client.zscore(group_key, member_id)

		if score is None:
			# Scenario: มาใหม่ หรือ หลุดไปแล้วกลับมาใหม่ (Reconnect)
			# ให้เซฟเวลาเริ่มต้น (Start Time)
			await self.client.hset(start_time_key, member_id, time.time())
			# resolve offline ถ้ามี event offline อยู่
			statement = select(Event).where(
				Event.probe_id == int(member_id),
				Event.name == "Probe Offline",
				Event.status == "firing",
				Event.resolved_at.is_(None),
			)
			result = await session.execute(statement)
			event = result.scalars().one_or_none()
			if event:
				event.status = "resolved"
				event.resolved_at = datetime.now(UTC)
				session.add(event)
				await session.commit()
		# บันทึก/อัปเดต timestamp ปัจจุบัน (ใช้ time.time())
		await self.client.zadd(group_key, {member_id: time.time()})
		# เคลียร์คนหมดอายุก่อน (ตามที่รีเควส)
		# await self._cleanup(group_key)

	# ---------------------------------------------------------
	# 2. Get Active Count
	# ---------------------------------------------------------
	async def get_active_count(self, group_key: str) -> int:
		"""
		นับจำนวนคนที่ online จริงๆ (เคลียร์คนเก่าทิ้งก่อนนับ)
		"""
		# await self._cleanup(group_key)

		# คืนค่าจำนวนสมาชิกที่เหลือใน Set (เร็วมาก O(1))
		return await self.client.zcard(group_key)

	# ---------------------------------------------------------
	# 3. Check is Online
	# ---------------------------------------------------------
	async def check_is_online(self, group_key: str, member_id: str) -> bool:
		"""
		เช็คเจาะจงว่า device นี้ online อยู่ไหม
		"""
		# await self._cleanup(group_key)

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
		# await self._cleanup(group_key)

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
