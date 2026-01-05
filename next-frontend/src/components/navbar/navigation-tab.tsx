"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardNavigationTab() {
	const path = usePathname();
	const [activeTab, setActiveTab] = useState("");

	useEffect(() => {
		setActiveTab(path.split("/")[1]);
	}, [path]);

	const tabsList = [
		{ name: "Dashboard", href: "dashboard" },
		{ name: "Analytics", href: "analytics" },
		{ name: "Settings", href: "settings" },
	];

	return (
		<nav className="hidden md:flex items-center gap-1 p-1 bg-sidebar-accent rounded-full border border-sidebar-ring">
			{tabsList.map((item) => (
				<Link
					key={item.name}
					href={`/${item.href}`}
					className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
						activeTab === item.href
							? "bg-primary text-white shadow-sm"
							: "text-sidebar-primary hover:text-sidebar-accent-foreground"
					} disabled:text-sidebar-primary/30`}
				>
					{item.name}
				</Link>
			))}
		</nav>
	);
}
