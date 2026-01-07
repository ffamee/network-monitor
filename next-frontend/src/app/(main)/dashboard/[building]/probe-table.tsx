"use client";

import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CheckCircle2, LaptopMinimal, Search } from "lucide-react";
import { useState } from "react";

interface Probe {
	id: string;
	name: string;
	location: string;
	ip: string;
	status: "online" | "offline" | "warning";
	latency: number;
	uptime: string;
	lastCheck: string;
}

const initialProbes: Probe[] = [
	{
		id: "PB-001",
		name: "Main Gateway - Fl.1",
		location: "Server Room A",
		ip: "192.168.1.1",
		status: "online",
		latency: 5,
		uptime: "99.9%",
		lastCheck: "1 min ago",
	},
	{
		id: "PB-002",
		name: "Access Point - Lobby",
		location: "Lobby Hall",
		ip: "192.168.1.15",
		status: "online",
		latency: 12,
		uptime: "98.5%",
		lastCheck: "1 min ago",
	},
	{
		id: "PB-003",
		name: "Switch Core - Fl.5",
		location: "Datacenter",
		ip: "192.168.5.2",
		status: "warning",
		latency: 150,
		uptime: "95.0%",
		lastCheck: "2 mins ago",
	},
	{
		id: "PB-004",
		name: "Camera Circuit - Parking",
		location: "Basement B2",
		ip: "192.168.10.44",
		status: "offline",
		latency: 0,
		uptime: "82.1%",
		lastCheck: "5 mins ago",
	},
	{
		id: "PB-005",
		name: "Office Wi-Fi - Fl.12",
		location: "East Wing",
		ip: "192.168.12.10",
		status: "online",
		latency: 8,
		uptime: "99.2%",
		lastCheck: "Now",
	},
	{
		id: "PB-006",
		name: "IoT Sensor - Temp",
		location: "Server Room A",
		ip: "192.168.1.200",
		status: "online",
		latency: 25,
		uptime: "99.9%",
		lastCheck: "Now",
	},
	{
		id: "PB-007",
		name: "Backup Server",
		location: "Server Room B",
		ip: "192.168.2.5",
		status: "online",
		latency: 4,
		uptime: "99.9%",
		lastCheck: "Now",
	},
	{
		id: "PB-008",
		name: "CCTV Recorder",
		location: "Security Office",
		ip: "192.168.3.10",
		status: "online",
		latency: 7,
		uptime: "99.7%",
		lastCheck: "Now",
	},
	{
		id: "PB-009",
		name: "Guest Wi-Fi - Fl.1",
		location: "Lobby Hall",
		ip: "192.168.1.50",
		status: "online",
		latency: 10,
		uptime: "98.9%",
		lastCheck: "Now",
	},
	{
		id: "PB-010",
		name: "Environmental Monitor",
		location: "Data Center",
		ip: "192.168.4.20",
		status: "online",
		latency: 15,
		uptime: "99.5%",
		lastCheck: "Now",
	},
	{
		id: "PB-011",
		name: "Access Point - Fl.8",
		location: "Conference Room",
		ip: "192.168.8.30",
		status: "online",
		latency: 9,
		uptime: "99.3%",
		lastCheck: "Now",
	},
	{
		id: "PB-012",
		name: "Firewall Appliance",
		location: "Server Room A",
		ip: "192.168.1.100",
		status: "offline",
		latency: 125,
		uptime: "69.8%",
		lastCheck: "10 mins ago",
	},
	{
		id: "PB-013",
		name: "Load Balancer",
		location: "Data Center",
		ip: "192.168.4.30",
		status: "online",
		latency: 20,
		uptime: "99.6%",
		lastCheck: "Now",
	},
	{
		id: "PB-014",
		name: "Access Point - Fl.20",
		location: "Rooftop Lounge",
		ip: "192.168.20.40",
		status: "online",
		latency: 18,
		uptime: "99.4%",
		lastCheck: "Now",
	},
	{
		id: "PB-015",
		name: "VPN Gateway",
		location: "Server Room B",
		ip: "192.168.2.100",
		status: "online",
		latency: 30,
		uptime: "99.7%",
		lastCheck: "Now",
	},
];

export const ProbeTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	// const headerRef = useRef(null);
	// const [headerRowWidth, setHeaderRowWidth] = useState<number>(0);

	const filteredProbes = initialProbes.filter(
		(p) =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.ip.includes(searchTerm)
	);

	// useEffect(() => {
	// 	if (!headerRef.current) return;
	// 	const observer = new ResizeObserver((entries) => {
	// 		for (const entry of entries) {
	// 			const height = entry.borderBoxSize[0]?.blockSize || 0;
	// 			setHeaderRowWidth(height);
	// 		}
	// 	});

	// 	observer.observe(headerRef.current);

	// 	return () => observer.disconnect();
	// }, []);

	return (
		<Card className="w-full ring-foreground/20 shadow-md h-auto rounded-4xl">
			<CardHeader className="py-2 h-full">
				<CardTitle className="flex flex-row gap-4 text-[clamp(1rem,0.7vw,2rem)] h-full items-center">
					<CheckCircle2 />
					สถานะอุปกรณ์ (Probes Status)
				</CardTitle>
				<CardAction>
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={16}
						/>
						<input
							type="text"
							placeholder="ค้นหา IP หรือ ชื่อ"
							className="bg-secondary border border-ring rounded-lg pl-9 pr-4 py-1.5
												text-sm text-secondary-foreground w-[clamp(8rem,20vw,32rem)]
												focus:outline-none focus:border-primary/75
												placeholder:text-muted-foreground"
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="*:overflow-y-scroll *:max-h-[50dvh] *:no-scrollbar *:overscroll-none">
					<Table className="w-full text-left text-sm border-collapse">
						<TableHeader
							className="sticky top-0 z-20 bg-card"
							// ref={headerRef}
						>
							<TableRow className="*:text-primary font-medium *:shadow-[inset_0_-2px_0_0_var(--destructive)]/70">
								<TableHead className="pb-3 pl-2 font-medium" />
								<TableHead className="pb-3 font-medium">ชื่ออุปกรณ์</TableHead>
								<TableHead className="pb-3 font-medium">IP Address</TableHead>
								<TableHead className="pb-3 font-medium">
									สถานที่ติดตั้ง
								</TableHead>
								<TableHead className="pb-3 font-medium">สถานะ</TableHead>
								<TableHead className="pb-3 font-medium text-right">
									Latency
								</TableHead>
								<TableHead className="pb-3 font-medium text-right">
									Uptime
								</TableHead>
								<TableHead className="pb-3 pr-2 font-medium text-right">
									ตรวจสอบล่าสุด
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="text-secondary-foreground/75 min-h-0 h-full">
							{filteredProbes.map((probe) => (
								<TableRow
									key={probe.id}
									className={`border-b border-secondary-foreground/30 bg-card hover:bg-accent transition-colors group
														has-checked:sticky has-checked:top-9.75 has-checked:border-none
														has-checked:shadow-[inset_0_-1.5px_0_0_var(--destructive),inset_0_1.5px_0_0_var(--destructive)]/50
														`}
								>
									<TableCell>
										{/* input check box */}
										<input
											type="checkbox"
											className="mt-1 ml-2 w-4 h-4 cursor-pointer accent-primary"
										/>
									</TableCell>
									<TableCell className="py-3 pl-2">
										<div className="flex items-center gap-3">
											<div
												className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-destructive/30 transition-colors
																			peer-has-checked:bg-primary"
											>
												<LaptopMinimal size={16} />
											</div>
											<div>
												<div className="font-medium">{probe.name}</div>
												<div className="text-xs text-secondary-foreground/50">
													{probe.id}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="py-3 font-mono">{probe.ip}</TableCell>
									<TableCell className="py-3">{probe.location}</TableCell>
									<TableCell className="py-3">
										<StatusBadge status={probe.status} />
									</TableCell>
									<TableCell className="py-3 text-right">
										<span
											className={`${
												probe.latency > 100 ? "text-amber-500" : ""
											}`}
										>
											{probe.latency} ms
										</span>
									</TableCell>
									<TableCell className="py-3 text-right text-emerald-500 dark:text-emerald-400">
										{probe.uptime}
									</TableCell>
									<TableCell className="py-3 pr-2 text-right">
										{probe.lastCheck}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				{filteredProbes.length === 0 && (
					<div className="text-center py-8 text-primary/70">
						ไม่พบข้อมูลที่ค้นหา
					</div>
				)}
			</CardContent>
		</Card>
	);
};

const StatusBadge = ({ status }: { status: string }) => {
	const styles = {
		online: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
		offline: "bg-rose-500/10 text-rose-500 border-rose-500/20",
		warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	};

	const labels = {
		online: "ปกติ",
		offline: "ออฟไลน์",
		warning: "แจ้งเตือน",
	};

	return (
		<span
			className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
				styles[status as keyof typeof styles] || styles.offline
			} flex items-center gap-1.5 w-fit`}
		>
			<span
				className={`w-1.5 h-1.5 rounded-full ${
					status === "online"
						? "bg-emerald-500"
						: status === "warning"
						? "bg-amber-500"
						: "bg-rose-500"
				}`}
			></span>
			{labels[status as keyof typeof labels]}
		</span>
	);
};
