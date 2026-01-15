import { BuildingAddForm } from "@/app/(action)/add/building/[slug]/add-building-form";
import { Modal } from "@/components/modal/modal";

export default async function EditBuildingModal({
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
	// return <Modal>Building Edit Modal Content {slug}</Modal>;
	return (
		<Modal>
			<BuildingAddForm {...{ zone: slug }} />
		</Modal>
	);
}
