import { Zone } from "@/models/zone";
import Link from "next/link";

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
		<main className="p-24 flex flex-col gap-4">
			Dashboard Home <br />
			{zones.length} zones found.
			{zones.map((zone) => (
				<Link
					key={zone.id}
					href={`/dashboard/${zone.slug}`}
					className="text-blue-400 hover:underline"
				>
					<div>{zone.name}</div>
				</Link>
			))}
			<Link href="/edit">Go to Edit Page</Link>
		</main>
	);
}
