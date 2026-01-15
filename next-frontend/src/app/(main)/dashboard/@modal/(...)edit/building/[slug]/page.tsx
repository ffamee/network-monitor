import { BuildingEditForm } from "@/app/(action)/edit/building/[slug]/edit-building-form";
import { Modal } from "@/components/modal/modal";

export default async function EditBuildingModal({
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
	// return <Modal>Building Edit Modal Content {slug}</Modal>;
	return (
		<Modal>
			<BuildingEditForm {...{ slug, building }} />
		</Modal>
	);
}
