import { StatChart } from "./stat-chart";

async function getInternalLatency(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/internal/latency/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch internal latency data");
	}
	const data = await res.json();
	return data;
}

async function getExternalLatency(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/external/latency/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch external latency data");
	}

	const data = await res.json();
	return data;
}

export default async function StatsCard({ probeId }: { probeId: string }) {
	const data = await getInternalLatency(probeId);
	const data2 = await getExternalLatency(probeId);

	const internalLatency = data[0]?._value || undefined;
	const externalLatency = data2[0]?._value || undefined;

	const chartData: {
		mode: "internal" | "external";
		value: number | undefined;
	}[] = [
		{ mode: "internal", value: internalLatency },
		{ mode: "external", value: externalLatency },
	];

	return (
		<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="flex flex-col h-full justify-center-safe w-full">
				{/* internal / external latency */}
				<StatChart
					data={chartData}
					topic="Latency"
					description="Internal vs External"
				/>
			</div>
			<div className="flex flex-col h-full justify-between p-4 w-full">
				<div className="text-4xl font-bold text-card-foreground">
					{/* {probeData.memoryUsage}% */}
					{/* wait for influxdb data */}
					65%
				</div>
				<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
					<div
						className="bg-purple-500 h-full rounded-full"
						style={{ width: `62.5%` }}
					></div>
				</div>
				<p className="text-xs text-slate-500 mt-2">5GB / 8GB Used</p>
			</div>
			<div className="flex flex-col h-full justify-between p-4 w-full">
				<div className="flex items-baseline gap-1">
					<div className="text-4xl font-bold text-card-foreground">
						{/* {probeData.temperature}° */}
						{/* wait for influxdb data */}
						45°
					</div>
					<span className="text-slate-500">C</span>
				</div>
				<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
					<div
						className={`h-full rounded-full ${
							45 > 60 ? "bg-red-500" : "bg-emerald-500"
						}`}
						// style={{ width: `${(data.temperature / 80) * 100}%` }}
						style={{ width: `${(45 / 100) * 100}%` }}
					></div>
				</div>
				<p className="text-xs text-slate-500 mt-2">Normal operating temp</p>
			</div>
		</div>
	);
}
