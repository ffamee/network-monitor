import { AlertTriangle, CircleX, History } from "lucide-react";
import LogPagination from "./log-pagination";
import Link from "next/link";

type LogEvent = {
	type: "info" | "warning" | "error";
	event: string;
	timestamp: string;
};

const getLogEvents = async (probe: string, date?: string, page?: string) => {
	const limit = 5;
	const skip = page ? (Number(page) - 1) * limit : 0;
	// create URL with params
	const url = new URL(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/events/${probe}`,
	);
	if (date) {
		url.searchParams.append("date", date);
	}
	url.searchParams.append("skip", skip.toString());
	url.searchParams.append("limit", limit.toString());
	try {
		const res = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			// next: { revalidate: 60 }, // Revalidate every 60 seconds
		});
		if (!res.ok) {
			throw new Error("Failed to fetch log events");
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching log events:", error);
		return [];
	}
};

export default async function LogCard({
	probe,
	date,
	page,
}: {
	probe: string;
	date?: string | string[];
	page?: string | string[];
}) {
	// if date is array, take first element
	const dateStr = Array.isArray(date) ? date[0] : date;
	const pageStr = Array.isArray(page) ? page[0] : page;
	const data: { date?: string; events: LogEvent[]; count: number } =
		await getLogEvents(probe, dateStr, pageStr);

	return (
		<div className="col-span-1 md:col-span-2 lg:col-span-4 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="text-lg font-semibold text-card-foreground flex items-center gap-2">
				Recent Events
				<History size={20} className="text-primary mb-2" />
				{data.date && (
					<span className="ml-auto text-sm text-secondary-foreground/70 hover:p-2 hover:bg-primary/50 rounded-full">
						<Link
							href={{
								pathname: "",
								query: { page: "1" },
							}}
						>
							<CircleX size={16} className="inline-block mr-2" />
							Date: {data.date}
						</Link>
					</span>
				)}
			</div>
			<div className="space-y-1 bg-card">
				{data.events.map((event, i) => (
					<div
						key={i}
						className="flex gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
					>
						<div
							className={`mt-1 min-w-2 h-2 rounded-full ${
								event.type === "info"
									? "bg-emerald-500"
									: event.type === "warning"
										? "bg-amber-500"
										: "bg-red-500"
							}`}
						></div>
						<div className="flex-1 space-y-2">
							<div className="text-sm text-card-foreground">{event.event}</div>
							<div className="text-xs text-secondary-foreground/70">
								{event.timestamp}
							</div>
						</div>
						{event.type === "warning" && (
							<AlertTriangle size={20} className="text-amber-500" />
						)}
						{event.type === "error" && (
							<CircleX size={20} className="text-red-500" />
						)}
					</div>
				))}
			</div>
			<LogPagination count={data.count} page={pageStr} date={dateStr} />
		</div>
	);
}
