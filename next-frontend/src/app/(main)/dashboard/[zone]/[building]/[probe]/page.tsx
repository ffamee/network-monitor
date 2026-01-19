import {
	Clock,
	Globe,
	LaptopMinimal,
	MapPin,
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

type Params = Promise<{ probe: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type ProbeInfo = {
	id: string;
	name: string;
	status: "Online" | "Offline" | "Degraded";
	ip: string;
	location: string;
	uptime: string;
	cpuLoad: number;
	memoryUsage: number;
	temperature: number;
	model: string;
	serialNumber: string;
	mac: string;
	firmware: string;
	installDate: string;
};

async function getProbeData(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
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
	params: Params;
	searchParams: SearchParams;
}) {
	const { probe } = await params;
	const { date, page } = await searchParams;
	const probeData: ProbeInfo = await getProbeData(probe);
	return (
		<div className="min-h-full h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
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
										<StatusBadge status={probeData.status} />
									</div>
									<div className="flex flex-wrap items-center gap-2 text-sm text-secondary-foreground/70">
										<span className="flex items-center gap-1.5">
											<Globe size={14} /> {probeData.ip}
										</span>
										<span className="flex items-center gap-1.5">
											<MapPin size={14} /> {probeData.location}
										</span>
										<span className="flex items-center gap-1.5">
											<Clock size={14} /> {probeData.uptime}
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
								<ManageButton />
							</div>
						</div>
					</div>

					{/* Calendar Card */}
					<LogCalendar probe={probe} />

					{/* Performance Stats (Small Cards) */}
					<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-ring shadow-md">
						<div className="flex flex-col h-full justify-between p-4 w-full">
							<div className="text-4xl font-bold text-card-foreground">
								{probeData.cpuLoad}%
							</div>
							<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
								<div
									className="bg-blue-500 h-full rounded-full"
									style={{ width: `${probeData.cpuLoad}%` }}
								></div>
							</div>
							<p className="text-xs text-slate-500 mt-2">Optimal range</p>
						</div>
						<div className="flex flex-col h-full justify-between p-4 w-full">
							<div className="text-4xl font-bold text-card-foreground">
								{probeData.memoryUsage}%
							</div>
							<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
								<div
									className="bg-purple-500 h-full rounded-full"
									style={{ width: `${probeData.memoryUsage}%` }}
								></div>
							</div>
							<p className="text-xs text-slate-500 mt-2">4GB / 8GB Used</p>
						</div>
						<div className="flex flex-col h-full justify-between p-4 w-full">
							<div className="flex items-baseline gap-1">
								<div className="text-4xl font-bold text-card-foreground">
									{probeData.temperature}°
								</div>
								<span className="text-slate-500">C</span>
							</div>
							<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
								<div
									className={`h-full rounded-full ${
										probeData.temperature > 60 ? "bg-red-500" : "bg-emerald-500"
									}`}
									// style={{ width: `${(data.temperature / 80) * 100}%` }}
									style={{ width: `${(probeData.temperature / 100) * 100}%` }}
								></div>
							</div>
							<p className="text-xs text-slate-500 mt-2">
								Normal operating temp
							</p>
						</div>
					</div>

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
