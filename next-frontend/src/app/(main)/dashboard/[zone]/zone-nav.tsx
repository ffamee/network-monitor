"use client";

import { Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function ZoneNav({ zone }: { zone: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon-lg"
					className="border border-sidebar-ring bg-sidebar-accent transition-colors"
				>
					<Ellipsis className="h-[1.2rem] w-[1.2rem] text-stone-900" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					<Link href={`/map?zone=${zone}`}>Open Map</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<a href={`/edit/zone/${zone}`}>Edit Zone in full Page</a>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
