"use client";

import { Activity, Undo2 } from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";
import Link from "next/link";

export default function MainIcon() {
	const path = usePathname();
	const pathSegments = path.split("/");
	const goBack = pathSegments.length > 2;
	const destination = goBack ? "." : "/";

	return (
		<Link
			href={destination}
			className="w-10 h-10 bg-linear-to-br from-primary to-destructive/70 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform duration-200"
		>
			{goBack ? (
				<Undo2 className="text-white" size={24} />
			) : (
				<Activity className="text-white" size={24} />
			)}
		</Link>
	);
}
