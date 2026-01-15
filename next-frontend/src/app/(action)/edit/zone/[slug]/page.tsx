import { ZoneEditForm } from "./edit-zone-form";
import EditZoneMap from "./edit-zone-map";

export default async function EditZonePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const zone = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${slug}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
	).then((res) => res.json());
	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			<EditZoneMap slug={slug} color={zone.color} />
			<div className="w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<ZoneEditForm {...{ slug, zone }} />
			</div>
		</div>
	);
}
