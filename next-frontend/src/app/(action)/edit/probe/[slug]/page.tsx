import { getIdFromSlug } from "@/lib/slug";
import EditBuildingComponentPage from "./edit-building-page";

async function getProbeData(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${probeId}/for-update`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) throw new Error("Network response was not ok");
	const probe = await res.json();
	return probe;
}

async function getBuildingList() {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/buildings-summary`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) throw new Error("Network response was not ok");
	const buildings = await res.json();
	return buildings;
}

export default async function EditBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const probeId = getIdFromSlug(slug);
	if (!probeId || isNaN(Number(probeId))) throw new Error("Invalid probe ID");
	const [probe, buildings] = await Promise.all([
		getProbeData(probeId),
		getBuildingList(),
	]);
	return <EditBuildingComponentPage {...{ probeId, probe, buildings }} />;
}
