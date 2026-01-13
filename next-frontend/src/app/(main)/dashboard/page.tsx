import Link from "next/link";

export default function DashboardPage() {
	return (
		<main className="p-24 flex flex-col gap-4">
			Dashboard Home
			<Link href="/dashboard/zone-a">Go to Zone A</Link>
			<Link href="/edit">Go to Edit Page</Link>
		</main>
	);
}
