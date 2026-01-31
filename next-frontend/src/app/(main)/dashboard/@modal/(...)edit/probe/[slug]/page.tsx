import { ProbeEditForm } from "@/app/(action)/edit/probe/[slug]/edit-probe-form";
import { Modal } from "@/components/modal/modal";
import { getIdFromSlug } from "@/lib/slug";

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

export default async function EditProbeModal({
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
	return (
		<Modal>
			<ProbeEditForm
				{...{
					probeId,
					probe,
					location: {
						lat: probe.lat,
						lng: probe.lng,
						...(probe.placeId && { placeId: probe.placeId }),
						...(probe.address && { address: probe.address }),
					},
					displayMode: "modal",
					buildings,
				}}
			/>
		</Modal>
	);
}
