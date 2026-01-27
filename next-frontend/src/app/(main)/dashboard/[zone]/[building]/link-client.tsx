"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

export default function LinkClient({
	slug,
	zoneSlug,
}: {
	slug: string;
	zoneSlug: string;
}) {
	return (
		<Link
			href={`/edit/building/${slug}`}
			title="แก้ไขข้อมูลอาคาร"
			onNavigate={() => {
				localStorage.setItem("zoneId", zoneSlug);
			}}
			className="cursor-pointer text-card-foreground/50 hover:text-primary/75 transition-colors"
		>
			<Pencil size={16} data-testid="edit-building-info-trigger" />
		</Link>
	);
}
