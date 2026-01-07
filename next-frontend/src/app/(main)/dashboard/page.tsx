import Link from "next/link";

export default function DashboardPage() {
	return (
		<div className="p-24 flex flex-col gap-4">
			Dashboard Home
			<Link href="/dashboard/building-1">Go to Building 1</Link>
			<Link href="/edit">Go to Edit Page</Link>
		</div>
	);
}
