from fastapi import APIRouter

router = APIRouter(
	prefix="/building",
	tags=["building"],
)

base_building = {
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
	"lat": 13.850022570498957,
	"lng": 100.57101354002953,
}

building_data = {"*": base_building}


@router.get("/{building}")
async def get_building(building: str) -> dict[str, object]:
	print(f"Requested building: {building}")
	# check if building exists
	if building not in building_data:
		return building_data["*"]
	return building_data[building]


@router.post("")
async def create_building(new_building: dict[str, object]) -> dict[str, str]:
	print(f"Creating new building with data: {new_building} {new_building.get('slug')}")
	# Here you would normally save the new building data to your database
	# copy base_building to new building_data
	slug = str(new_building.get("name")).lower().replace(" ", "-")
	# building_data[slug] = base_building.copy()
	# building_data[slug].update(new_building)
	building_data[slug] = new_building
	return {"message": "Building created successfully", "building": slug}


@router.put("/{building}")
async def update_building(
	building: str, updated_data: dict[str, object]
) -> dict[str, str]:
	print(f"Updating building: {building} with data: {updated_data}")
	# Here you would normally update the building data in your database
	if building not in building_data:
		building_data["*"].update(updated_data)
		# update floor even if it not in updated_data
		for i in ["floor", "admin", "tel"]:
			if i not in updated_data:
				building_data["*"][i] = None
	else:
		building_data[building].update(updated_data)
		# update floor even if it not in updated_data
		for i in ["floor", "admin", "tel"]:
			if i not in updated_data:
				building_data[building][i] = None

	return {"message": f"Building {building} updated successfully"}


@router.patch("/mapping/{building}")
async def update_building_mapping(
	building: str, mapping_data: dict[str, object]
) -> dict[str, str]:
	print(f"Updating building mapping for: {building} with data: {mapping_data}")
	# Here you would normally update the building mapping data in your database
	if building not in building_data:
		return {"message": f"Building {building} not found"}

	building_data[building]["location"] = mapping_data

	return {"message": f"Building {building} mapping updated successfully"}
