"use client";

import { StatusBadge } from "@/components/badge/status-badge";
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
import Link from "next/link";
import { useEffect, useState } from "react";
import AddProbeButton from "./add-probe-button";
import { ProbeWithStats } from "@/models/probe";
import { formatTimeAgo } from "@/lib/formatter";

export const ProbeTable = ({
	buildingId,
	buildingSlug,
}: {
	buildingId: string;
	buildingSlug: string;
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [probes, setProbes] = useState<ProbeWithStats[]>([]);

	useEffect(() => {
		const getProbesInBuilding = async (buildingId: string) => {
			// Fetch probes from API or database based on buildingId
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/building/${buildingId}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				},
			);
			if (!res.ok) {
				throw new Error("Failed to fetch probes data");
			}
			const data = await res.json();
			setProbes(data);
		};

		getProbesInBuilding(buildingId);
	}, [buildingId]);
	// const headerRef = useRef(null);
	// const [headerRowWidth, setHeaderRowWidth] = useState<number>(0);

	const filteredProbes = probes.filter(
		(p) =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(p.ipAddress && p.ipAddress.includes(searchTerm)),
	);

	return (
		<Card className="w-full ring-foreground/20 shadow-md h-auto rounded-4xl">
			<CardHeader className="py-2 h-full">
				<CardTitle className="flex flex-row gap-4 text-[clamp(1rem,0.7vw,2rem)] h-full items-center">
					<CheckCircle2 />
					สถานะอุปกรณ์ (Probes Status)
				</CardTitle>
				<CardAction className="flex gap-4">
					<AddProbeButton building={buildingSlug} />
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
				<div className="*:overflow-y-scroll *:max-h-[50dvh] *:no-scrollbar *:overscroll-auto">
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
								{/* <TableHead className="pb-3 font-medium text-right">
									Latency
								</TableHead> */}
								<TableHead className="pb-3 font-medium text-right">
									Uptime
								</TableHead>
								{/* <TableHead className="pb-3 pr-2 font-medium text-right">
									ตรวจสอบล่าสุด
								</TableHead> */}
							</TableRow>
						</TableHeader>
						<TableBody className="text-secondary-foreground/75 min-h-0 h-full">
							{filteredProbes.map((probe, idx) => (
								<TableRow
									key={idx}
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
										<Link
											href={`${buildingSlug}/${probe.slug}`}
											title={`ดูรายละเอียดของ ${probe.name}`}
											className="flex items-center gap-3"
										>
											<div
												className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-destructive/30 transition-colors
																			peer-has-checked:bg-primary"
											>
												<LaptopMinimal size={16} />
											</div>
											<div>
												<div className="font-medium">{probe.name}</div>
												<div className="text-xs text-secondary-foreground/50">
													Probe-{probe.id}
												</div>
											</div>
										</Link>
									</TableCell>
									<TableCell className="py-3 font-mono">
										{probe.ipAddress || "-"}
									</TableCell>
									<TableCell
										className="py-3 max-w-32 truncate"
										title={probe.address || ""}
									>
										{probe.address || "-"}
									</TableCell>
									<TableCell className="py-3">
										<StatusBadge status={probe.status || "offline"} />
									</TableCell>
									{/* <TableCell className="py-3 text-right">
										<span
											className={`${
												probe.latency > 100 ? "text-amber-500" : ""
											}`}
										>
											{probe.latency || "0"} ms
										</span>
									</TableCell> */}
									{/* <TableCell className="py-3 text-right text-emerald-500 dark:text-emerald-400">
										{probe.uptime || "0"}
									</TableCell> */}
									<TableCell className="py-3 pr-2 text-right">
										{/* {formatTimeAgo(
											new Date(probe.lastSeenAt || probe.updatedAt),
										)} */}
										{probe.uptime ? formatTimeAgo(probe.uptime) : "-"}
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
