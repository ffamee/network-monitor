import { ZoneEditForm } from "@/app/(action)/edit/zone/[slug]/edit-zone-form";
import { Modal } from "@/components/modal/modal";
import { formatFeatureCollections } from "@/lib/formatter";
import { getIdFromSlug } from "@/lib/slug";
import { Zone } from "@/models/zone";

export default async function EditZoneModal({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const zoneId = getIdFromSlug(slug);
	if (!zoneId || isNaN(Number(zoneId))) throw new Error("Invalid zone slug");
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${zoneId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch zone data");
	}
	const zone: Zone = await res.json();
	const paths = zone.geojson
		? JSON.stringify(formatFeatureCollections(zone.geojson))
		: null;

	return (
		<Modal>
			<ZoneEditForm
				zone={zone}
				zoneId={zoneId}
				color={zone.color}
				paths={paths}
			/>
		</Modal>
	);
}
