// --- Types ---

interface BuildingInfo {
	name: string;
	address: string;
	contact: string;
	floorCount: number;
	totalProbes: number;
	images: string[];
}

// --- Mock Data ---
const buildingData: BuildingInfo = {
	name: "อาคารนวัตกรรมดิจิทัล (Digital Innovation Tower)",
	address: "123 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110",
	contact: "คุณสมชาย (IT Manager) - 081-234-5678",
	floorCount: 24,
	totalProbes: 48,
	images: [
		"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2668&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
	],
};

const healthMetrics = [
	{
		id: 1,
		label: "Core Network",
		percent: 98,
		status: "Healthy",
		icon: "server",
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
	{
		id: 2,
		label: "Wi-Fi Coverage",
		percent: 85,
		status: "Good",
		icon: "wifi",
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
	{
		id: 3,
		label: "CCTV Storage",
		percent: 62,
		status: "Warning",
		icon: "hard-drive",
		color: "text-amber-500",
		bg: "bg-amber-500/10",
	},
	{
		id: 4,
		label: "UPS Load",
		percent: 45,
		status: "Stable",
		icon: "zap",
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		id: 5,
		label: "IP Cameras",
		percent: 92,
		status: "Active",
		icon: "video",
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
];

import React, { Suspense } from "react";
import { TrendingUp, Map as MapIcon, Image as ImageIcon } from "lucide-react";
import { BuildingImageCarousel } from "./image-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TrafficSplitBar } from "./traffic-bar";
import { BuildingStatusCarousel } from "./status-carousel";
import { UpTimeCard } from "./uptime-card";
import { AlertCard } from "./alert-card";
import { InfoCard } from "./info-card";
import GoogleMap from "@/components/gl-map/google-map";
import { ProbeTable } from "./probe-table";
// const GoogleMap = dynamic(() => import("@/components/gl-map/google-map"), {
// 	ssr: false,
// 	loading: () => (
// 		<Skeleton className="aspect-square w-xs md:w-sm lg:w-lg">
// 			<div className="w-full h-full flex items-center justify-center">
// 				<Spinner className="size-16" />
// 			</div>
// 		</Skeleton>
// 	),
// });

// --- Components ---

export default function BuildingPage() {
	return (
		<div className="min-h-full h-dvh overflow-y-auto overscroll-none no-scrollbar bg-background font-sans animate-in fade-in duration-500">
			{/* Main Content (Bento Grid) */}
			<main className="pt-24 pb-12 px-4 max-w-screen flex flex-col space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr] gap-4 auto-rows-[minmax(160px,auto)]">
					<div className="md:row-span-2 w-full flex justify-center items-center">
						<Tabs
							defaultValue="image"
							className="relative h-auto lg:h-auto w-3/4 md:w-full max-w-xs md:max-w-sm lg:max-w-lg shadow-md
						ring-foreground/20 bg-card text-card-foreground gap-4 rounded-4xl text-xs/relaxed ring-1 flex flex-col"
						>
							{/* View Toggle Button */}
							<TabsList className="absolute top-4 right-4 z-40 flex bg-black/40 backdrop-blur-md rounded-lg p-1! border border-white/10 h-10! shadow-lg">
								<TabsTrigger
									value="image"
									title="รูปภาพ"
									className={`rounded-md transition-all duration-200 p-2! h-8
										text-slate-400 hover:text-white hover:bg-white/10
										data-active:bg-white/20 data-active:text-white data-active:shadow-sm
										dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10
										dark:data-active:bg-white/20 dark:data-active:text-white dark:data-active:shadow-sm`}
								>
									<ImageIcon className="size-4" />
								</TabsTrigger>
								<TabsTrigger
									value="map"
									title="แผนที่"
									className={`rounded-md transition-all duration-200 p-2! h-8
										text-slate-400 hover:text-white hover:bg-white/10
										data-active:bg-white/20 data-active:text-white data-active:shadow-sm
										dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10
										dark:data-active:bg-white/20 dark:data-active:text-white dark:data-active:shadow-sm`}
								>
									<MapIcon className="size-4" />
								</TabsTrigger>
							</TabsList>

							{/* Content Area */}
							<div className="w-full h-full *:h-full *:w-full p-2 flex items-center justify-center">
								<TabsContent value="image">
									<BuildingImageCarousel {...buildingData} />
								</TabsContent>
								<TabsContent value="map">
									<Suspense
										fallback={
											<Skeleton className="aspect-square w-xs md:w-sm lg:w-lg">
												<div className="w-full h-full flex items-center justify-center">
													<Spinner className="size-16" />
												</div>
											</Skeleton>
										}
									>
										<GoogleMap />
									</Suspense>
								</TabsContent>
							</div>
						</Tabs>
					</div>
					<InfoCard {...buildingData} />
					<div className="grid grid-cols-2 gap-4 h-full">
						<Suspense fallback={<Skeleton className="h-full rounded-4xl" />}>
							<UpTimeCard />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-full rounded-4xl" />}>
							<AlertCard />
						</Suspense>
					</div>
					<div className="h-full md:col-span-2 grid grid-cols-3 gap-4">
						<Card className="ring-foreground/20 shadow-md h-auto rounded-4xl col-span-2">
							<CardHeader>
								<CardTitle>
									<div className="flex items-center gap-3">
										<div className="p-2 bg-primary rounded-xl text-primary-foreground">
											<TrendingUp size={20} />
										</div>
										<div className="text-card-foreground font-semibold text-lg">
											Average Traffic Ratio
										</div>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent className="h-full">
								<Suspense fallback={<Spinner className="h-full rounded-4xl" />}>
									<TrafficSplitBar />
								</Suspense>
							</CardContent>
						</Card>
						<div
							className="w-full h-full shadow-md
						ring-foreground/20 bg-card text-card-foreground gap-4 rounded-4xl text-xs/relaxed ring-1 flex flex-col"
						>
							<Suspense fallback={<Skeleton className="h-full rounded-4xl" />}>
								<BuildingStatusCarousel data={healthMetrics} />
							</Suspense>
						</div>
					</div>
				</div>
				{/* 7. Probe Table (Span 12 cols) - Row 3 */}
				<ProbeTable />
			</main>
		</div>
	);
}
