import { BuildingEditForm } from "./edit-building-form";

export default async function EditBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const building = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/building/${slug}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
	).then((res) => res.json());
	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			<div className="bg-amber-500 w-full h-full" />
			<div className="w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<BuildingEditForm {...{ slug, building }} />
			</div>
		</div>
	);
}
