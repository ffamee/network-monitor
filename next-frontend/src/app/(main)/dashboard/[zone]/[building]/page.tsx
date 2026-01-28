import { Suspense } from "react";
import { TrendingUp, Map as MapIcon, Image as ImageIcon } from "lucide-react";
import { BuildingImageCarousel } from "./image-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TrafficSplitBar } from "./traffic-bar";
import { UpTimeCard } from "./uptime-card";
import { AlertCard } from "./alert-card";
import { InfoCard } from "./info-card";
import GoogleMap from "@/components/gl-map/google-map";
import { ProbeTable } from "./probe-table";
import { getIdFromSlug } from "@/lib/slug";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Building } from "@/models/building";
import BuildingMapMarker from "./building-map-marker";
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

// --- Types ---

async function getBuildingData(buildingId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/building/${buildingId}`,
		{
			headers: {
				// Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch building data");
	}
	const data = await res.json();
	return data;
}

export default async function BuildingPage({
	params,
}: {
	params: Promise<{ zone: string; building: string }>;
}) {
	const { zone, building } = await params;

	const buildingId = getIdFromSlug(building);
	if (!buildingId || isNaN(Number(buildingId))) notFound();
	const buildingData: Building = await getBuildingData(buildingId);

	if (!buildingData) notFound();
	if (buildingData.slug !== building) {
		if (process.env.NODE_ENV === "development") {
			redirect(`${buildingData.slug}`);
		} else {
			permanentRedirect(`${buildingData.slug}`);
		}
	}

	console.log("buildingData:", buildingData);
	return (
		<div className="min-h-full h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
			{/* Main Content (Bento Grid) */}
			<main className="pt-24 pb-12 px-4 max-w-screen flex flex-col space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr] gap-4 auto-rows-[minmax(160px,auto)]">
					{/* Image and Map */}
					<div className="md:row-span-2 w-full flex justify-center items-center h-full">
						<Tabs
							defaultValue="image"
							className="relative h-auto md:h-full w-3/4 md:w-full max-w-xs md:max-w-sm lg:max-w-lg shadow-md
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
									<BuildingImageCarousel
										images={buildingData.images}
										name={buildingData.name}
										address={buildingData.address}
									/>
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
										<GoogleMap
											{...{
												props: {
													className: "aspect-square",
													clickableIcons: true,
													defaultCenter: {
														lat: buildingData.lat,
														lng: buildingData.lng,
													},
													defaultZoom: 18,
												},
											}}
										>
											<BuildingMapMarker
												position={{
													lat: buildingData.lat,
													lng: buildingData.lng,
												}}
											/>
										</GoogleMap>
									</Suspense>
								</TabsContent>
							</div>
						</Tabs>
					</div>

					{/* Building Information Card */}
					<InfoCard building={buildingData} slug={building} zoneSlug={zone} />

					{/* 4. Uptime & Alert Cards */}
					<div className="grid grid-cols-2 lg:grid-rows-2 gap-4 h-full">
						<Suspense
							fallback={
								<Skeleton className="h-full rounded-4xl lg:col-span-2" />
							}
						>
							<UpTimeCard />
						</Suspense>
						<Suspense
							fallback={
								<Skeleton className="h-full rounded-4xl lg:col-span-2" />
							}
						>
							<AlertCard />
						</Suspense>
					</div>

					{/* 5. Traffic Ratio */}
					<div className="h-full md:col-span-2">
						<Card className="ring-foreground/20 shadow-md h-full rounded-4xl col-span-2">
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
					</div>
				</div>

				{/* 6. Probe Table */}
				<ProbeTable buildingId={buildingId} buildingSlug={building} />
			</main>
		</div>
	);
}
