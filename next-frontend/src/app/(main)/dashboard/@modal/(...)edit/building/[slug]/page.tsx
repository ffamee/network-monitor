import { BuildingEditForm } from "@/app/(action)/edit/building/[slug]/edit-building-form";
import { Modal } from "@/components/modal/modal";
import { getIdFromSlug } from "@/lib/slug";
import { Building } from "@/models/building";

export default async function EditBuildingModal({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const buildingId = getIdFromSlug(slug);
	if (!buildingId || isNaN(Number(buildingId)))
		throw new Error("Invalid building slug");
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/building/${buildingId}/for-update`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch building data");
	}
	const building = await res.json();

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
				}}
			/>
		</Modal>
	);
}
