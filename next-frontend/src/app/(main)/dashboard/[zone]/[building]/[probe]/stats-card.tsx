// import { StatChart } from "./stat-chart";

// async function getInternalLatency(probeId: string) {
// 	const res = await fetch(
// 		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/internal/latency/${probeId}`,
// 		{
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			credentials: "include",
// 		},
// 	);
// 	if (!res.ok) {
// 		throw new Error("Failed to fetch internal latency data");
// 	}
// 	const data = await res.json();
// 	return data;
// }

// async function getExternalLatency(probeId: string) {
// 	const res = await fetch(
// 		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/external/latency/${probeId}`,
// 		{
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			credentials: "include",
// 		},
// 	);
// 	if (!res.ok) {
// 		throw new Error("Failed to fetch external latency data");
// 	}

// 	const data = await res.json();
// 	return data;
// }

async function getPinglatency(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/ping/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch ping latency data");
	}
	const data = await res.json();
	return data;
}

async function getDnsResolutionTime(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/dns/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch DNS resolution time data");
	}
	const data = await res.json();
	return data;
}

async function getBandwidth(probeId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/bandwidth/probe/${probeId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch bandwidth data");
	}
	const data = await res.json();
	return data;
}

export default async function StatsCard({ probeId }: { probeId: string }) {
	// const data = await getInternalLatency(probeId);
	// const data2 = await getExternalLatency(probeId);
	const data = await getPinglatency(probeId);
	const data3 = await getDnsResolutionTime(probeId);
	const data4 = await getBandwidth(probeId);

	// console.log("StatsCard data:", data, data3, data4);
	// const internalLatency = data[0]?._value || undefined;
	// const externalLatency = data2[0]?._value || undefined;
	const pingLatency = data[0]?._value || undefined;
	const pingStatus = data[1]?._value ?? 2;
	const dnsResolutionTime = data3[0]?._value || undefined;
	const dnsStatus = data3[1]?._value ?? 2;
	const downloadBandwidth = data4[0]?._value || 0;
	const uploadBandwidth = data4[1]?._value || 0;
	// const chartData: {
	// 	mode: "internal" | "external";
	// 	value: number | undefined;
	// }[] = [
	// 	{ mode: "internal", value: internalLatency },
	// 	{ mode: "external", value: externalLatency },
	// ];

	// console.log(
	// 	pingLatency,
	// 	pingStatus,
	// 	dnsResolutionTime,
	// 	dnsStatus,
	// 	downloadBandwidth,
	// 	uploadBandwidth,
	// );

	return (
		<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="flex flex-col h-full justify-between p-4 w-full">
				{/* internal / external latency */}
				{/* <StatChart
					data={chartData}
					topic="Latency"
					description="Internal vs External"
				/> */}
				<div className="text-4xl font-bold text-card-foreground">
					{pingStatus === 2
						? "ERROR"
						: pingStatus === 1
							? "NO SUCH HOST"
							: (pingLatency ? pingLatency.toFixed(2) : "-") + " ms"}
				</div>
				<p className="text-xs text-slate-500 mt-2">Ping Latency</p>
			</div>
			<div className="flex flex-col h-full justify-between p-4 w-full">
				{/* <div className="text-4xl font-bold text-card-foreground">65%</div>
				<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
					<div
						className="bg-purple-500 h-full rounded-full"
						style={{ width: `62.5%` }}
					></div>
				</div>
				<p className="text-xs text-slate-500 mt-2">5GB / 8GB Used</p> */}
				<div className="text-4xl font-bold text-card-foreground">
					{dnsStatus === 2
						? "ERROR"
						: dnsStatus === 1
							? "TIMEOUT"
							: (dnsResolutionTime ? dnsResolutionTime.toFixed(2) : "-") +
								" ms"}
				</div>
				<p className="text-xs text-slate-500 mt-2">DNS Resolution Time</p>
			</div>
			<div className="flex flex-col h-full justify-between p-4 w-full">
				<div className="flex items-baseline gap-1">
					<div className="text-xl font-bold text-card-foreground">
						{/* {probeData.temperature}° */}
						{/* wait for influxdb data */}
						{/* 45° */}
						{downloadBandwidth.toFixed(2)} / {uploadBandwidth.toFixed(2)} Mbps
					</div>
					{/* <span className="text-slate-500"></span> */}
				</div>
				<p className="text-xs text-slate-500 mt-2">
					Download / Upload Bandwidth
				</p>
			</div>
		</div>
	);
}
