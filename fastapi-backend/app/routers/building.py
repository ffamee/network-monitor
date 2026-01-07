from fastapi import APIRouter

router = APIRouter(
	prefix="/building",
	tags=["building"],
)

building_data = {
	"name": "อาคารนวัตกรรมดิจิทัล (Digital Innovation Tower)",
	"address": "123 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110",
	"admin": "คุณสมชาย (IT Manager)",
	"tel": "081-234-5678",
	"floor": 24,
	"totalProbes": 48,
	"images": [
		"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2668&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
	],
}


@router.get("/{building}")
async def get_building(building: str) -> dict[str, object]:
	print(f"Requested building: {building}")
	return building_data


@router.put("/{building}")
async def update_building(
	building: str, updated_data: dict[str, object]
) -> dict[str, str]:
	print(f"Updating building: {building} with data: {updated_data}")
	# Here you would normally update the building data in your database
	building_data.update(updated_data)
	# update floor even if it not in updated_data
	for i in ["floor", "admin", "tel"]:
		if i not in updated_data:
			building_data[i] = None

	return {"message": f"Building {building} updated successfully"}
