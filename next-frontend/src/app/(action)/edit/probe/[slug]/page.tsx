import EditBuildingComponentPage from "./edit-building-page";

export default async function EditBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const probe = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${slug}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	).then((res) => res.json());
	return <EditBuildingComponentPage {...{ slug, probe }} />;
}
