import { Zone } from "@/models/zone";
import Link from "next/link";
import GoogleMap from "@/components/gl-map/google-map";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserLocationMap from "./user-location";
import UserMap from "./user-map";

async function getAllZones() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!res.ok) {
		throw new Error("Failed to fetch zones");
	}
	const data = await res.json();
	return data;
}

// Mock data for suggested probes
const mockProbes = [
	{
		id: 1,
		name: "Probe A",
		location: "Building 1",
		status: "Active",
		temperature: "22°C",
	},
	{
		id: 2,
		name: "Probe B",
		location: "Building 2",
		status: "Warning",
		temperature: "28°C",
	},
	{
		id: 3,
		name: "Probe C",
		location: "Building 3",
		status: "Active",
		temperature: "21°C",
	},
	{
		id: 4,
		name: "Probe D",
		location: "Building 1",
		status: "Inactive",
		temperature: "N/A",
	},
];

export default async function DashboardPage() {
	const zones: Zone[] = await getAllZones();

	return (
		<main className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold">Dashboard</h1>

			{/* Top Section: Map and Probes Table */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Map Component */}
				<Card className="h-[50dvh]">
					<CardHeader>
						<CardTitle>Zone Map</CardTitle>
					</CardHeader>
					<CardContent className="h-full">
						<GoogleMap>
							<UserLocationMap />
							<UserMap />
						</GoogleMap>
					</CardContent>
				</Card>

				{/* Suggested Probes Table */}
				<Card className="">
					<CardHeader>
						<CardTitle>Suggested Probes</CardTitle>
					</CardHeader>
					<CardContent className="overflow-auto h-[calc(100%-5rem)]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Temp</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mockProbes.map((probe) => (
									<TableRow key={probe.id}>
										<TableCell className="font-medium">{probe.name}</TableCell>
										<TableCell>{probe.location}</TableCell>
										<TableCell>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													probe.status === "Active"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: probe.status === "Warning"
															? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
															: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
												}`}
											>
												{probe.status}
											</span>
										</TableCell>
										<TableCell>{probe.temperature}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Bottom Section: All Zones Table */}
			<Card>
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle>All Zones ({zones.length})</CardTitle>
					<Link
						href="/add/zone"
						className="bg-primary px-2 py-1 rounded-sm hover:bg-primary/70 text-background"
					>
						Add Zone
					</Link>
				</CardHeader>
				<CardContent>
					<div className="overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Zone Name</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{zones.map((zone) => (
									<TableRow key={zone.id}>
										<TableCell>
											<Link href={`/dashboard/${zone.slug}`} className="">
												{zone.name}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{zone.description || "-"}
										</TableCell>
										<TableCell className="space-x-4">
											<Link
												href={`/edit/zone/${zone.slug}`}
												className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
											>
												Edit
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
