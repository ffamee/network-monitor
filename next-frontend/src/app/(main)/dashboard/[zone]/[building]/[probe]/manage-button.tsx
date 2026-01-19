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

export function ManageButton() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon-lg"
					className="border border-sidebar-ring bg-sidebar-accent transition-colors"
				>
					<Ellipsis className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					<Link href="/edit">Edit Probe</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link href="/grafana">Open in Grafana</Link>
				</DropdownMenuItem>
				<DropdownMenuItem className="block lg:hidden">
					<Link href="/refresh">Refresh</Link>
				</DropdownMenuItem>
				<DropdownMenuItem className="block md:hidden">
					<Link href="/console">Open Console</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
