# app/tasks/heartbeat_tasks.py

from app.db import async_session_maker
from app.services.redis import get_redis_service


async def check_offline_probes_task():
	"""
	Job นี้จะถูกเรียกโดย APScheduler ตามเวลาที่กำหนด
	"""
	# 1. สร้าง Service Instance
	# (timeout=60 คือถ้าไม่ส่ง heartbeat มาเกิน 60 วิ ถือว่าดับ)
	redis_client = get_redis_service()

	# 2. เปิด DB Session ใหม่ สำหรับรอบการทำงานนี้
	async with async_session_maker() as session:
		try:
			# เรียกฟังก์ชัน cleanup ที่เราเขียนไว้ก่อนหน้านี้
			# await hb_service.process_offline_probes(session)
			await redis_client.cleanup(session=session)
		except Exception as e:
			# ควร Log error ไว้ เผื่อ DB ล่ม Job จะได้ไม่พังเงียบๆ
			print(f"Error in check_offline_probes_task: {e}")
