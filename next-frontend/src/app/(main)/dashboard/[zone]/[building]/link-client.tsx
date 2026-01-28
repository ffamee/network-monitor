"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

/**
 * LinkClient component for editing building information.
 * @param props
 * @param props.slug - The slug identifier for the building.
 *
 * @deprecated This component is deprecated. Please use the Link component directly in your code instead.
 */
export default function LinkClient({ slug }: { slug: string }) {
	return (
		<Link
			href={`/edit/building/${slug}`}
			title="แก้ไขข้อมูลอาคาร"
			className="cursor-pointer text-card-foreground/50 hover:text-primary/75 transition-colors"
		>
			<Pencil size={16} data-testid="edit-building-info-trigger" />
		</Link>
	);
}
