import { BuildingEditForm } from "@/app/(action)/edit/building/[slug]/edit-building-form";
import { Modal } from "@/components/modal/modal";
import { getIdFromSlug } from "@/lib/slug";

async function getBuildingData(buildingId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/building/${buildingId}/for-update`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) throw new Error("Network response was not ok");
	const building = await res.json();
	return building;
}

async function getZonesList() {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/summary`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) throw new Error("Network response was not ok");
	const zones = await res.json();
	return zones;
}

export default async function EditBuildingModal({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const buildingId = getIdFromSlug(slug);
	if (!buildingId || isNaN(Number(buildingId)))
		throw new Error("Invalid building slug");
	const [building, zones] = await Promise.all([
		getBuildingData(buildingId),
		getZonesList(),
	]);

	return (
		<Modal>
			<BuildingEditForm
				{...{
					buildingId,
					building,
					displayMode: "modal",
					location: {
						...(building.googlePlaceId && { placeId: building.googlePlaceId }),
						lat: building.lat,
						lng: building.lng,
						...(building.address && { address: building.address }),
					},
					zones,
				}}
			/>
		</Modal>
	);
}
