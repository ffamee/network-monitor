import asyncio

from fastapi import APIRouter

router = APIRouter(
	prefix="/zone",
	tags=["zone"],
)

zones: list[dict[str, object]] = [
	{
		"id": 1,
		"name": "Zone A",
		"description": "พื้นที่โซน A ครอบคลุมส่วนหน้าของอาคารและพื้นที่สีเขียวรอบๆ",
		"color": "#FF5733",
		"paths": [
			{"lat": 13.850329, "lng": 100.565729},
			{"lat": 13.848506, "lng": 100.565529},
			{"lat": 13.846635, "lng": 100.564573},
			{"lat": 13.842655, "lng": 100.571624},
			{"lat": 13.844137, "lng": 100.572495},
			{"lat": 13.850383, "lng": 100.572475},
		],
		"locations": [
			{
				"key": "zone-a-poi-1",
				"location": {"lat": 13.84905181, "lng": 100.56649934},
			},
			{
				"key": "zone-a-poi-2",
				"location": {"lat": 13.84909917, "lng": 100.56706385},
			},
			{
				"key": "zone-a-poi-3",
				"location": {"lat": 13.85007482, "lng": 100.56836345},
			},
			{
				"key": "zone-a-poi-4",
				"location": {"lat": 13.84835769, "lng": 100.56952907},
			},
			{
				"key": "zone-a-poi-5",
				"location": {"lat": 13.84709586, "lng": 100.56796151},
			},
			{
				"key": "zone-a-poi-6",
				"location": {"lat": 13.84781133, "lng": 100.57100285},
			},
			{
				"key": "zone-a-poi-7",
				"location": {"lat": 13.84661454, "lng": 100.56758637},
			},
			{
				"key": "zone-a-poi-8",
				"location": {"lat": 13.84627631, "lng": 100.56792132},
			},
			{
				"key": "zone-a-poi-9",
				"location": {"lat": 13.84625036, "lng": 100.56973004},
			},
			{
				"key": "zone-a-poi-10",
				"location": {"lat": 13.84511854, "lng": 100.56880558},
			},
			{
				"key": "zone-a-poi-11",
				"location": {"lat": 13.84638038, "lng": 100.56733181},
			},
			{
				"key": "zone-a-poi-12",
				"location": {"lat": 13.84674462, "lng": 100.56510774},
			},
			{
				"key": "zone-a-poi-13",
				"location": {"lat": 13.84584703, "lng": 100.57132448},
			},
			{
				"key": "zone-a-poi-14",
				"location": {"lat": 13.8447543, "lng": 100.57115022},
			},
			{
				"key": "zone-a-poi-15",
				"location": {"lat": 13.84690073, "lng": 100.5719541},
			},
		],
		"slug": "zone-a",
	},
	{
		"id": 2,
		"name": "Zone B",
		"description": "พื้นที่โซน B ครอบคลุมส่วนหลังของอาคารและลานจอดรถ",
		"color": "#33C1FF",
		"paths": [
			{"lat": 13.852444, "lng": 100.572619},
			{"lat": 13.848521, "lng": 100.572641},
			{"lat": 13.848533, "lng": 100.576594},
			{"lat": 13.852408, "lng": 100.576189},
		],
		"locations": [
			{
				"key": "zone-b-poi-1",
				"location": {"lat": 13.85083259, "lng": 100.57363254},
			},
			{
				"key": "zone-b-poi-2",
				"location": {"lat": 13.85017605, "lng": 100.57451221},
			},
			{
				"key": "zone-b-poi-3",
				"location": {"lat": 13.84940896, "lng": 100.57521701},
			},
			{
				"key": "zone-b-poi-4",
				"location": {"lat": 13.85120848, "lng": 100.57489911},
			},
			{
				"key": "zone-b-poi-5",
				"location": {"lat": 13.85165909, "lng": 100.57575201},
			},
		],
		"slug": "zone-b",
	},
	{
		"id": 3,
		"name": "Zone C",
		"description": "พื้นที่โซน C ครอบคลุมทางเดินรอบอาคารและพื้นที่นันทนาการ",
		"color": "#75FF33",
		"paths": [
			{"lat": 13.855420, "lng": 100.566238},
			{"lat": 13.852506, "lng": 100.564503},
			{"lat": 13.851842, "lng": 100.565718},
			{"lat": 13.850557, "lng": 100.565661},
			{"lat": 13.850566, "lng": 100.572425},
			{"lat": 13.856202, "lng": 100.572462},
		],
		"locations": [
			{
				"key": "zone-c-poi-1",
				"location": {"lat": 13.85411234, "lng": 100.56678912},
			},
			{
				"key": "zone-c-poi-2",
				"location": {"lat": 13.85345678, "lng": 100.56543219},
			},
			{
				"key": "zone-c-poi-3",
				"location": {"lat": 13.85278945, "lng": 100.56612345},
			},
			{
				"key": "zone-c-poi-4",
				"location": {"lat": 13.85198765, "lng": 100.56567890},
			},
			{
				"key": "zone-c-poi-5",
				"location": {"lat": 13.85134567, "lng": 100.56523456},
			},
			{
				"key": "zone-c-poi-6",
				"location": {"lat": 13.85087654, "lng": 100.56634567},
			},
			{
				"key": "zone-c-poi-7",
				"location": {"lat": 13.85512345, "lng": 100.57123456},
			},
			{
				"key": "zone-c-poi-8",
				"location": {"lat": 13.85456789, "lng": 100.57098765},
			},
			{
				"key": "zone-c-poi-9",
				"location": {"lat": 13.85391234, "lng": 100.57134567},
			},
			{
				"key": "zone-c-poi-10",
				"location": {"lat": 13.85234567, "lng": 100.57012345},
			},
			{
				"key": "zone-c-poi-11",
				"location": {"lat": 13.85167890, "lng": 100.57145678},
			},
			{
				"key": "zone-c-poi-12",
				"location": {"lat": 13.85601234, "lng": 100.57234567},
			},
			{
				"key": "zone-c-poi-13",
				"location": {"lat": 13.85567890, "lng": 100.57123456},
			},
			{
				"key": "zone-c-poi-14",
				"location": {"lat": 13.85412345, "lng": 100.57098765},
			},
			{
				"key": "zone-c-poi-15",
				"location": {"lat": 13.85356789, "lng": 100.57134567},
			},
		],
		"slug": "zone-c",
	},
	{
		"id": 4,
		"name": "Zone D",
		"description": "พื้นที่โซน D ครอบคลุมทางเดินด้านข้างของอาคารและสวนหย่อม",
		"color": "#FF33A8",
		"paths": [
			{"lat": 13.849392, "lng": 100.576674},
			{"lat": 13.848493, "lng": 100.576682},
			{"lat": 13.848436, "lng": 100.576044},
			{"lat": 13.846836, "lng": 100.576043},
			{"lat": 13.847769, "lng": 100.579772},
			{"lat": 13.847588, "lng": 100.580087},
			{"lat": 13.849453, "lng": 100.581128},
			{"lat": 13.849530, "lng": 100.581150},
			{"lat": 13.849846, "lng": 100.580350},
		],
		"locations": [
			{
				"key": "zone-d-poi-1",
				"location": {"lat": 13.84890012, "lng": 100.57734567},
			},
			{
				"key": "zone-d-poi-2",
				"location": {"lat": 13.84845678, "lng": 100.57812345},
			},
			{
				"key": "zone-d-poi-3",
				"location": {"lat": 13.84791234, "lng": 100.57923456},
			},
			{
				"key": "zone-d-poi-4",
				"location": {"lat": 13.84734567, "lng": 100.57898765},
			},
			{
				"key": "zone-d-poi-5",
				"location": {"lat": 13.84812345, "lng": 100.58012345},
			},
			{
				"key": "zone-d-poi-6",
				"location": {"lat": 13.84901234, "lng": 100.57987654},
			},
			{
				"key": "zone-d-poi-7",
				"location": {"lat": 13.84934567, "lng": 100.57876543},
			},
			{
				"key": "zone-d-poi-8",
				"location": {"lat": 13.84867890, "lng": 100.57765432},
			},
			{
				"key": "zone-d-poi-9",
				"location": {"lat": 13.84789012, "lng": 100.57654321},
			},
			{
				"key": "zone-d-poi-10",
				"location": {"lat": 13.84923456, "lng": 100.58098765},
			},
		],
		"slug": "zone-d",
	},
	{
		"id": 5,
		"name": "Zone E",
		"description": "พื้นที่โซน E ครอบคลุมทางเดินด้านหลังของอาคารและพื้นที่บริการ",
		"color": "#FFC133",
		"paths": [
			{"lat": 13.856134, "lng": 100.572567},
			{"lat": 13.852569, "lng": 100.572631},
			{"lat": 13.852482, "lng": 100.576220},
			{"lat": 13.849454, "lng": 100.576589},
			{"lat": 13.849883, "lng": 100.580348},
			{"lat": 13.849555, "lng": 100.581197},
			{"lat": 13.851318, "lng": 100.582212},
			{"lat": 13.857497, "lng": 100.581422},
		],
		"locations": [
			{
				"key": "zone-e-poi-1",
				"location": {"lat": 13.85456789, "lng": 100.57412345},
			},
			{
				"key": "zone-e-poi-2",
				"location": {"lat": 13.85391234, "lng": 100.57523456},
			},
			{
				"key": "zone-e-poi-3",
				"location": {"lat": 13.8528426, "lng": 100.57326319},
			},
			{
				"key": "zone-e-poi-4",
				"location": {"lat": 13.85330366, "lng": 100.57465135},
			},
			{
				"key": "zone-e-poi-5",
				"location": {"lat": 13.85601234, "lng": 100.57834567},
			},
			{
				"key": "zone-e-poi-6",
				"location": {"lat": 13.85567890, "lng": 100.57923456},
			},
			{
				"key": "zone-e-poi-7",
				"location": {"lat": 13.85412345, "lng": 100.57898765},
			},
			{
				"key": "zone-e-poi-8",
				"location": {"lat": 13.85356789, "lng": 100.57934567},
			},
			{
				"key": "zone-e-poi-9",
				"location": {"lat": 13.85290123, "lng": 100.57812345},
			},
			{
				"key": "zone-e-poi-10",
				"location": {"lat": 13.85123456, "lng": 100.57945678},
			},
			{
				"key": "zone-e-poi-11",
				"location": {"lat": 13.85678901, "lng": 100.58012345},
			},
			{
				"key": "zone-e-poi-12",
				"location": {"lat": 13.85534567, "lng": 100.58123456},
			},
			{
				"key": "zone-e-poi-13",
				"location": {"lat": 13.85467890, "lng": 100.58098765},
			},
			{
				"key": "zone-e-poi-14",
				"location": {"lat": 13.85312345, "lng": 100.58134567},
			},
			{
				"key": "zone-e-poi-15",
				"location": {"lat": 13.85256789, "lng": 100.58012345},
			},
			{
				"key": "zone-e-poi-16",
				"location": {"lat": 13.85190123, "lng": 100.58145678},
			},
			{
				"key": "zone-e-poi-17",
				"location": {"lat": 13.85126701, "lng": 100.57795490},
			},
			{
				"key": "zone-e-poi-18",
				"location": {"lat": 13.85143430, "lng": 100.57793116},
			},
			{
				"key": "zone-e-poi-19",
				"location": {"lat": 13.85589012, "lng": 100.58087654},
			},
			{
				"key": "zone-e-poi-20",
				"location": {"lat": 13.85423456, "lng": 100.57976543},
			},
		],
		"slug": "zone-e",
	},
]


images = [
	"https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?q=80&w=688&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1508062878650-88b52897f298?q=80&w=627&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1598966835412-6de6f92c243d?q=80&w=687&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1500033963968-1151893623e1?q=80&w=687&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1517586979036-b7d1e86b3345?q=80&w=688&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1488034976201-ffbaa99cbf5c?q=80&w=687&auto=format&fit=crop",
]


@router.get("")
async def get_all_zone() -> list[dict[str, object]]:
	print("Requested zone")
	return zones


@router.get("/{zone_slug}")
async def get_zone(zone_slug: str) -> dict[str, object]:
	print(f"Requested zone: {zone_slug}")
	# set 0.5 second delay to simulate real api call
	await asyncio.sleep(0.5)
	all_zones = await get_all_zone()
	res = filter(
		lambda z: z["slug"] == zone_slug,
		all_zones,
	)
	result = list(res)[0] if res else None
	if result and res:
		return {
			**result,
			"images": images,
			"totalBuildings": 8,
			"totalProbes": len(result["locations"]),
		}
	return {"error": "Zone not found"}


# edit zone put api
@router.put("/{zone_slug}")
async def update_zone(
	zone_slug: str, updated_data: dict[str, object]
) -> dict[str, str]:
	print(f"Updating zone: {zone_slug} with data: {updated_data}")
	# Here you would normally update the zone data in your database
	for zone in zones:
		if zone["slug"] == zone_slug:
			zone.update(updated_data)
			# update floor even if it not in updated_data
			for i in ["description"]:
				if i not in updated_data:
					zone[i] = None
			# update slug to match zone name ** need slugify function here **
			zone["slug"] = str(zone["name"]).lower().replace(" ", "-")
			return {
				"message": f"Zone {zone_slug} updated successfully",
				"zoneId": str(zone["slug"]),
			}
	return {"message": f"Zone {zone_slug} not found"}


@router.patch("/mapping/{zone_slug}")
async def update_zone_mapping(zone_slug: str, mapping_data: dict[str, object]) -> None:
	await asyncio.sleep(1)
	print(f"Updating zone mapping: {zone_slug} with data: {mapping_data}")
