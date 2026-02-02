import {
	Clock,
	Globe,
	LaptopMinimal,
	MapPin,
	Pencil,
	RefreshCw,
	Terminal,
} from "lucide-react";

import { ManageButton } from "./manage-button";
import BarChart from "./bar-chart";
import ProbeInfoCard from "./probe-info-card";
import LogCard from "./log-card";
import { StatusBadge } from "@/components/badge/status-badge";
import LogCalendar from "./log-calendar";
import { Suspense } from "react";
import Link from "next/link";
import { getIdFromSlug } from "@/lib/slug";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { ProbeWithStats } from "@/models/probe";
import StatsCard from "./stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/formatter";

async function getProbeData(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch probe data");
	}
	const data = await res.json();
	return data;
}

export default async function ProbePage({
	params,
	searchParams,
}: {
	params: Promise<{ probe: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { probe } = await params;
	const probeId = getIdFromSlug(probe);
	if (!probeId || isNaN(Number(probeId))) notFound();
	const probeData: ProbeWithStats = await getProbeData(probeId);

	if (!probeData) notFound();
	if (probeData.slug !== probe) {
		if (process.env.NODE_ENV === "development") {
			redirect(`${probeData.slug}`);
		} else {
			permanentRedirect(`${probeData.slug}`);
		}
	}

	const { date, page } = await searchParams;
	console.log("Probe Data:", probeData);

	return (
		<div className="container mx-auto h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
			<main className="pt-24 pb-12 px-4 max-w-screen">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)] animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Header Card (Full Width) */}
					<div className="col-span-1 md:col-span-3 lg:col-span-4 border-l-6 border-l-primary bg-card border border-ring rounded-2xl p-6 shadow-md">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 h-full">
							<div className="flex items-center gap-4">
								<div className="w-16 h-16 rounded-2xl bg-primary flex shrink-0 items-center justify-center shadow-inner">
									<LaptopMinimal size={32} className="text-card" />
								</div>
								<div>
									<div className="flex items-center gap-4 mb-1">
										<h2 className="text-[clamp(1rem,2vw,1.5rem)] font-bold text-card-foreground">
											{probeData.name}
										</h2>
										{/* <StatusBadge status={probeData.status} /> */}
										<StatusBadge status={probeData.status} />
										<Link
											href={`/edit/probe/${probe}`}
											title="แก้ไขข้อมูลอุปกรณ์"
											className="cursor-pointer text-foreground/50 hover:text-primary/75 transition-colors text-[clamp(1rem,4vw,1.25rem)]"
										>
											<Pencil
												data-testid="edit-zone-info-trigger"
												className="w-[1em] h-[1em]"
											/>
										</Link>
									</div>
									<div className="flex flex-wrap items-center gap-2 text-sm text-secondary-foreground/70">
										<span className="flex items-center gap-1.5">
											<Globe size={14} /> {probeData.ipAddress || "N/A"}
										</span>
										<span className="flex items-center gap-1.5">
											<MapPin size={14} /> {probeData.address || "-"}
										</span>
										<span className="flex items-center gap-1.5">
											<Clock size={14} /> {formatTimeAgo(probeData.uptime)}
										</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2 self-end md:self-center">
								<button className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors border border-stone-700">
									<Terminal size={16} /> Console
								</button>
								<button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
									<RefreshCw size={16} /> Refresh
								</button>
								<ManageButton probe={probe} />
							</div>
						</div>
					</div>

					{/* Calendar Card */}
					<LogCalendar probe={probeId} />

					{/* Performance Stats (Small Cards) */}
					<Suspense
						fallback={
							<Skeleton className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 " />
						}
					>
						<StatsCard probeId={probeId} />
					</Suspense>

					{/* Info Card (Tall) */}
					<ProbeInfoCard probe={probeData} />

					{/* Chart (Large Span) - Placeholder for now */}
					<BarChart />

					{/* Logs Card */}
					<Suspense fallback={<div>Loading logs...</div>}>
						<LogCard {...{ probe, date, page }} />
					</Suspense>
				</div>
			</main>
		</div>
	);
}
