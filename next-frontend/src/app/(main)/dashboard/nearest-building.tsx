"use client";

import { StatusBadge } from "@/components/badge/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Building } from "@/models/building";
import { ProbeFullStats } from "@/models/probe";
import { useEffect, useState } from "react";

type NearestBuildingType = {
	building: Building & { probes: ProbeFullStats[] };
	distance: number; // in meters
};

type SortColumn = "name" | "status" | "latency" | "dns" | "download" | "upload";
type SortDirection = "asc" | "desc";

export default function NearestBuilding() {
	const [building, setBuilding] = useState<NearestBuildingType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	useEffect(() => {
		const fetchNestestBuilding = async (lat: number, lng: number) => {
			try {
				// Fetch nearest building from API based on user location
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/building/nearest?lat=${lat}&lng=${lng}`,
					{
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					},
				);
				if (!res.ok) {
					throw new Error("Failed to fetch nearest building data");
				}
				const data = await res.json();
				if (data && data.distance <= 50) {
					setBuilding(data);
				} else {
					setBuilding(null);
					// setBuilding(data);
				}
			} finally {
				setIsLoading(false);
			}
		};

		// Get user's current location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const userLat = position.coords.latitude;
					const userLng = position.coords.longitude;
					fetchNestestBuilding(userLat, userLng);
				},
				(error) => {
					console.error("Error getting user location:", error);
				},
			);
		} else {
			console.error("Geolocation is not supported by this browser.");
		}
	}, []);

	console.log("Nearest Building:", building);

	const probes = building?.building?.probes || [];

	// Sort probes if a sort column is selected
	const sortedProbes = sortColumn
		? [...probes].sort((a, b) => {
				let aValue: string | number = "";
				let bValue: string | number = "";

				switch (sortColumn) {
					case "name":
						aValue = a.name.toLowerCase();
						bValue = b.name.toLowerCase();
						break;
					case "status":
						aValue = a.status.toLowerCase();
						bValue = b.status.toLowerCase();
						break;
					case "latency":
						aValue = typeof a.latency === "string" ? 999999 : a.latency;
						bValue = typeof b.latency === "string" ? 999999 : b.latency;
						break;
					case "dns":
						aValue = typeof a.dns === "string" ? 999999 : a.dns;
						bValue = typeof b.dns === "string" ? 999999 : b.dns;
						break;
					case "download":
						aValue = a.download ?? -1;
						bValue = b.download ?? -1;
						break;
					case "upload":
						aValue = a.upload ?? -1;
						bValue = b.upload ?? -1;
						break;
				}

				if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
				if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
				return 0;
			})
		: probes;

	// Group probes by floor
	const probesByFloor = sortedProbes.reduce(
		(acc, probe) => {
			const floor = probe.floor ?? "No Floor";
			if (!acc[floor]) {
				acc[floor] = [];
			}
			acc[floor].push(probe);
			return acc;
		},
		{} as Record<string | number, ProbeFullStats[]>,
	);

	// Sort floors (numeric floors first, then "No Floor")
	const sortedFloors = Object.keys(probesByFloor).sort((a, b) => {
		if (a === "No Floor") return 1;
		if (b === "No Floor") return -1;
		return Number(a) - Number(b);
	});

	return (
		<Card className="">
			<CardHeader>
				<CardTitle>Near By Buildings</CardTitle>
				{building !== null && (
					<div className="text-sm text-muted-foreground mt-2 flex justify-between">
						<p>
							Building:{" "}
							<span className="font-medium text-foreground">
								{building.building.name}
							</span>
						</p>
						<p>
							Distance:{" "}
							<span className="font-medium text-foreground">
								{building.distance.toFixed(2)}m
							</span>
						</p>
					</div>
				)}
			</CardHeader>
			<CardContent className="overflow-auto h-[calc(100%-5rem)]">
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<Spinner />
					</div>
				) : building === null ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<p>No nearby building found within 50 meters</p>
					</div>
				) : probes.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<p>No probes available in this building</p>
					</div>
				) : (
					<div className="space-y-6">
						{sortedFloors.map((floor) => (
							<div key={floor}>
								<div className="mb-3 pb-2 border-b">
									<h3 className="font-semibold text-sm">
										{floor === "No Floor"
											? "No Floor Assigned"
											: `Floor ${floor}`}
									</h3>
								</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("name")}
											>
												<div className="flex items-center gap-2">
													Name
													{sortColumn === "name" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("status")}
											>
												<div className="flex items-center gap-2">
													Status
													{sortColumn === "status" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("latency")}
											>
												<div className="flex items-center gap-2">
													Latency
													{sortColumn === "latency" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("dns")}
											>
												<div className="flex items-center gap-2">
													DNS Query
													{sortColumn === "dns" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("download")}
											>
												<div className="flex items-center gap-2">
													Download
													{sortColumn === "download" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
											<TableHead
												className="cursor-pointer select-none hover:bg-muted/50"
												onClick={() => handleSort("upload")}
											>
												<div className="flex items-center gap-2">
													Upload
													{sortColumn === "upload" && (
														<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
													)}
												</div>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{probesByFloor[floor].map((probe) => (
											<TableRow key={probe.id}>
												<TableCell className="font-medium">
													{probe.name}
												</TableCell>
												<TableCell>
													<StatusBadge status={probe.status} />
												</TableCell>
												<TableCell
													data-type={typeof probe.latency}
													className="data-[type=string]:text-rose-500"
												>
													{typeof probe.latency === "string"
														? probe.latency
														: `${probe.latency.toFixed(2)} ms`}
												</TableCell>
												<TableCell
													data-type={typeof probe.dns}
													className="data-[type=string]:text-rose-500"
												>
													{typeof probe.dns === "string"
														? probe.dns
														: `${probe.dns.toFixed(2)} ms`}
												</TableCell>
												<TableCell>
													{probe.download?.toFixed(2) ?? "N/A"} Mbps
												</TableCell>
												<TableCell>
													{probe.upload?.toFixed(2) ?? "N/A"} Mbps
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
