// import { ZoneEdit } from "./edit-zone-form";
// import EditZoneMap from "./edit-zone-map";

import { BuildingAddForm } from "./add-building-form";

export default async function EditZonePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	// const zone = await fetch(
	// 	`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${slug}`,
	// 	{
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		credentials: "include",
	// 	}
	// ).then((res) => res.json());
	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			add zone page
			<BuildingAddForm {...{ zone: slug }} />
		</div>
	);
}
