import {
	Clock,
	Globe,
	MapPin,
	RefreshCw,
	Server,
	Settings,
	Terminal,
	Wifi,
} from "lucide-react";

const probeData = {
	id: "PB-001",
	name: "Main Gateway - Fl.1",
	type: "Router / Gateway",
	ip: "192.168.1.1",
	mac: "00:1B:44:11:3A:B7",
	location: "Server Room A, Rack 2",
	status: "online",
	uptime: "45d 12h 30m",
	lastSeen: "Just now",
	firmware: "v2.4.5-stable",
	model: "Enterprise Gateway XG-7100",
	installDate: "15 Jan 2023",
	temperature: 42,
	cpuLoad: 28,
	memoryUsage: 45,
	events: [
		{
			time: "10:30 AM",
			message: "Configuration settings saved by admin",
			type: "info",
		},
		{ time: "09:15 AM", message: "Interface eth0 link up", type: "info" },
		{
			time: "Yesterday",
			message: "High latency detected on WAN1 (150ms)",
			type: "warning",
		},
		{
			time: "2 days ago",
			message: "System rebooted after firmware update",
			type: "info",
		},
	],
};

export default function ProbePage() {
	return (
		<div className="min-h-full h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
			<main className="pt-24 pb-12 px-4 max-w-screen flex flex-col space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)] animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Header Card (Full Width) */}
					<div className="col-span-1 md:col-span-3 lg:col-span-4 border-l-4 border-l-blue-500 bg-card border border-ring">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 h-full">
							<div className="flex items-center gap-4">
								<div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center shadow-inner">
									{probeData.type.includes("Router") ? (
										<Server size={32} className="text-blue-400" />
									) : (
										<Wifi size={32} className="text-emerald-400" />
									)}
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<h2 className="text-2xl font-bold text-card-foreground">
											{probeData.name}
										</h2>
										{/* <StatusBadge status={probeData.status} /> */}
									</div>
									<div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
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
								<button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
									<Terminal size={16} /> Console
								</button>
								<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
									<RefreshCw size={16} /> Restart
								</button>
								<button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700">
									<Settings size={20} />
								</button>
							</div>
						</div>
					</div>

					{/* Performance Stats (Small Cards) */}
					{/* <Card title="CPU Load" className="col-span-1 border-slate-800">
				<div className="flex flex-col h-full justify-between mt-2">
					<div className="text-4xl font-bold text-white">{data.cpuLoad}%</div>
					<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
						<div
							className="bg-blue-500 h-full rounded-full"
							style={{ width: `${data.cpuLoad}%` }}
						></div>
					</div>
					<p className="text-xs text-slate-500 mt-2">Optimal range</p>
				</div>
			</Card>
			<Card title="Memory Usage" className="col-span-1 border-slate-800">
				<div className="flex flex-col h-full justify-between mt-2">
					<div className="text-4xl font-bold text-white">
						{data.memoryUsage}%
					</div>
					<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
						<div
							className="bg-purple-500 h-full rounded-full"
							style={{ width: `${data.memoryUsage}%` }}
						></div>
					</div>
					<p className="text-xs text-slate-500 mt-2">4GB / 8GB Used</p>
				</div>
			</Card>
			<Card title="Temperature" className="col-span-1 border-slate-800">
				<div className="flex flex-col h-full justify-between mt-2">
					<div className="flex items-baseline gap-1">
						<div className="text-4xl font-bold text-white">
							{data.temperature}°
						</div>
						<span className="text-slate-500">C</span>
					</div>
					<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
						<div
							className={`h-full rounded-full ${
								data.temperature > 60 ? "bg-red-500" : "bg-emerald-500"
							}`}
							style={{ width: `${(data.temperature / 80) * 100}%` }}
						></div>
					</div>
					<p className="text-xs text-slate-500 mt-2">Normal operating temp</p>
				</div>
			</Card> */}

					{/* Info Card (Tall) */}
					{/* <Card
				title="Device Information"
				icon={Cpu}
				className="col-span-1 row-span-2"
			>
				<div className="space-y-4 mt-2">
					{[
						{ label: "Model", value: data.model },
						{ label: "Serial No.", value: "SN-7788-X1" },
						{ label: "MAC Address", value: data.mac },
						{ label: "Firmware", value: data.firmware },
						{ label: "Installed", value: data.installDate },
						{ label: "Last Maintenance", value: "2 months ago" },
					].map((item, i) => (
						<div
							key={i}
							className="pb-3 border-b border-slate-800 last:border-0 last:pb-0"
						>
							<div className="text-xs text-slate-500 mb-1">{item.label}</div>
							<div className="text-sm font-medium text-white break-words">
								{item.value}
							</div>
						</div>
					))}
				</div>
			</Card> */}

					{/* Chart (Large Span) - Placeholder for now */}
					{/* <Card
				title="Traffic Throughput (24h)"
				icon={Activity}
				className="col-span-1 md:col-span-2 lg:col-span-3"
			>
				<div className="h-40 flex items-end justify-between gap-1 mt-4">
					{Array.from({ length: 40 }).map((_, i) => {
						const h = Math.floor(Math.random() * 80) + 10;
						return (
							<div
								key={i}
								className="w-full bg-slate-800/50 hover:bg-blue-500/50 rounded-t transition-colors relative group"
								style={{ height: `${h}%` }}
							>
								<div className="absolute bottom-0 w-full bg-blue-500/80 h-1/2 rounded-t opacity-60"></div>
							</div>
						);
					})}
				</div>
				<div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
					<span>00:00</span>
					<span>06:00</span>
					<span>12:00</span>
					<span>18:00</span>
					<span>Now</span>
				</div>
			</Card> */}

					{/* Logs Card */}
					{/* <Card
				title="Recent Events"
				icon={History}
				className="col-span-1 md:col-span-2 lg:col-span-3"
			>
				<div className="space-y-1">
					{data.events.map((event, i) => (
						<div
							key={i}
							className="flex gap-3 p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-800"
						>
							<div
								className={`mt-1 min-w-[8px] h-2 rounded-full ${
									event.type === "info"
										? "bg-blue-500"
										: event.type === "warning"
										? "bg-amber-500"
										: "bg-red-500"
								}`}
							></div>
							<div className="flex-1">
								<p className="text-sm text-slate-300">{event.message}</p>
								<p className="text-xs text-slate-500 mt-1">{event.time}</p>
							</div>
							{event.type === "warning" && (
								<AlertTriangle size={16} className="text-amber-500" />
							)}
						</div>
					))}
				</div>
			</Card> */}
				</div>
			</main>
		</div>
	);
}
