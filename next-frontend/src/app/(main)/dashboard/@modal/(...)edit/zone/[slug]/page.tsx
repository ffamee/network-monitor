import { ZoneEditForm } from "@/app/(action)/edit/zone/[slug]/edit-zone-form";
import { Modal } from "@/components/modal/modal";

export default async function EditZoneModal({
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
	// return <Modal>Building Edit Modal Content {slug}</Modal>;
	return (
		<Modal>
			<ZoneEditForm {...{ slug, zone }} />
		</Modal>
	);
}
