import { getIdFromSlug } from "@/lib/slug";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import EditZoneComponentPage from "./edit-zone-page";

export default async function EditZonePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const zoneId = getIdFromSlug(slug);
	if (!zoneId || isNaN(Number(zoneId))) notFound();
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${zoneId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) throw new Error("Network response was not ok");
	const zone = await res.json();

	if (!zone) notFound();
	if (zone.slug !== slug) {
		if (process.env.NODE_ENV === "development") {
			redirect(`/edit/zone/${zone.slug}`);
		} else {
			permanentRedirect(`/edit/zone/${zone.slug}`);
		}
	}

	console.dir(zone, { depth: null });

	return <EditZoneComponentPage zone={zone} />;
}
