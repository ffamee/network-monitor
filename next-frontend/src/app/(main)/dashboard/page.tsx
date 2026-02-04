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
import NearestBuilding from "./nearest-building";

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
				<NearestBuilding />
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
									<TableHead>Description</TableHead>
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
