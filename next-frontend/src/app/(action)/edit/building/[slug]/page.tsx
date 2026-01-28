import { getIdFromSlug } from "@/lib/slug";
import EditBuildingComponentPage from "./edit-building-page";

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

export default async function EditBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const buildingId = getIdFromSlug(slug);
	if (!buildingId || isNaN(Number(buildingId)))
		throw new Error("Invalid building ID");
	const [building, zones] = await Promise.all([
		getBuildingData(buildingId),
		getZonesList(),
	]);
	return <EditBuildingComponentPage {...{ buildingId, building, zones }} />;
}
