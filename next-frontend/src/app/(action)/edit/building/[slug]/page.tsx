import EditBuildingComponentPage from "./edit-building-page";

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
		},
	).then((res) => res.json());
	return <EditBuildingComponentPage {...{ slug, building }} />;
}
