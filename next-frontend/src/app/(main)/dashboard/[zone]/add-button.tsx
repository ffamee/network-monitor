"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";

export default function AddButton({ zone }: { zone: string }) {
	const isMobile = useMediaQuery("(max-width: 480px)");

	return (
		<Link href={`/add/building/${zone}`}>
			{isMobile ? (
				<div className="bg-primary text-primary-foreground rounded-full p-2 absolute bottom-4 right-4 transition-all hover:scale-105 hover:bg-primary/80 cursor-pointer z-30">
					<Plus size={20} />
				</div>
			) : (
				<Button size="lg" className="cursor-pointer">
					Add
				</Button>
			)}
		</Link>
	);
}
