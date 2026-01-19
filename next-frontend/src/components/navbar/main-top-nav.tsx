import { ModeToggle } from "@/components/theme/togglemode";
import { Activity } from "lucide-react";
import Link from "next/link";
import MainNavigationTab from "./navigation-tab";
import CurrentTime from "./current-time";
import { MainMenu } from "./menu-button";
import MainIcon from "./main-icon";

export default function MainTopNavBar() {
	return (
		<header className="fixed top-0 w-full z-50 bg-sidebar-accent/75 text-sidebar-accent-foreground backdrop-brightness-75 backdrop-blur-md border-b border-sidebar-border">
			<div className="min-w-full mx-auto px-4 h-16 flex items-center justify-between">
				{/* Clickable Header for Home Navigation */}
				<div
					className="flex items-center gap-3 cursor-pointer"
					title="กลับสู่หน้าหลัก"
				>
					<MainIcon />
					<Link
						href="/"
						className="cursor-pointer group"
						title="กลับสู่หน้าหลัก"
					>
						<h1 className="text-primary font-bold text-lg leading-tight group-hover:text-accent-foreground transition-colors">
							ProbeMon
						</h1>
						<p className="text-xs text-muted-foreground">
							Network Monitoring Dashboard
						</p>
					</Link>
				</div>

				<MainNavigationTab />

				<div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)]">
					<div className="hidden md:block">
						<ModeToggle />
					</div>
					<div className="text-primary/80 hover:text-primary transition-colors md:hidden cursor-pointer">
						<MainMenu />
					</div>
					<CurrentTime />
					<div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors">
						<img
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
							alt="Admin"
						/>
					</div>
				</div>
			</div>
		</header>
	);
}
