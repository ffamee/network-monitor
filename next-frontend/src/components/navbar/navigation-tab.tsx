"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MainNavigationTab() {
	const path = usePathname();
	const [activeTab, setActiveTab] = useState("");

	useEffect(() => {
		setActiveTab(path.split("/")[1]);
	}, [path]);

	const tabsList = [
		{ name: "Map", href: "map" },
		{ name: "Dashboard", href: "dashboard" },
		{ name: "Settings", href: "settings" },
	];

	return (
		<nav className="hidden md:grid md:grid-cols-3 items-center gap-1 p-1 bg-sidebar-accent rounded-full border border-sidebar-ring">
			{tabsList.map((item) => (
				<Link
					key={item.name}
					href={`/${item.href}`}
					data-active={activeTab === item.href ? "true" : "false"}
					className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full text-center ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]
										data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-sm
										data-[active=false]:text-sidebar-primary data-[active=false]:hover:text-sidebar-accent-foreground"
				>
					{item.name}
				</Link>
			))}
		</nav>
	);
}
