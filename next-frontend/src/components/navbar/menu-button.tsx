"use client";

import * as React from "react";
import { Menu } from "lucide-react"; // Import Menu icon
import { useTheme } from "next-themes";
import Link from "next/link"; // สมมติว่าใช้ Next.js

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"; // อย่าลืม import Switch

export function MainMenu() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon-lg" // หรือ size="icon" ตาม config ของคุณ
					className="border border-sidebar-ring bg-sidebar-accent"
				>
					{/* เปลี่ยน Trigger เป็น Menu Icon */}
					<Menu className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				{/* กลุ่ม Link */}
				<DropdownMenuItem asChild>
					<Link href="/dashboard" className="cursor-pointer">
						Dashboard
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/map" className="cursor-pointer">
						Map
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/settings" className="cursor-pointer">
						Setting
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* ส่วน Toggle Theme */}
				<div className="flex items-center justify-between px-2 py-1.5">
					<label
						htmlFor="theme-mode"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Dark Mode
					</label>
					<Switch
						id="theme-mode"
						checked={resolvedTheme === "dark"}
						onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
					/>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
