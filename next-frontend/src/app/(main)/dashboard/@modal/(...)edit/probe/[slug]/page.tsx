import { ProbeEditForm } from "@/app/(action)/edit/probe/[slug]/edit-probe-form";
import { Modal } from "@/components/modal/modal";

export default async function EditProbeModal({
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
	// return <Modal>Building Edit Modal Content {slug}</Modal>;
	return (
		<Modal>
			<ProbeEditForm
				{...{
					slug,
					probe,
					displayMode: "modal",
					location: {
						lat: probe.lat,
						lng: probe.lng,
						...(probe.placeId && { placeId: probe.placeId }),
						...(probe.address && { address: probe.address }),
					},
				}}
			/>
		</Modal>
	);
}
