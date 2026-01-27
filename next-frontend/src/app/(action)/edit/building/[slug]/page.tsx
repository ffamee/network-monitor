import { getIdFromSlug } from "@/lib/slug";
import EditBuildingComponentPage from "./edit-building-page";

export default async function EditBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const buildingId = getIdFromSlug(slug);
	if (!buildingId || isNaN(Number(buildingId)))
		throw new Error("Invalid building ID");
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
	return <EditBuildingComponentPage {...{ buildingId, building }} />;
}
