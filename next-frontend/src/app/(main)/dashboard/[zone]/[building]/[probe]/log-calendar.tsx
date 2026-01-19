import CalendarButton from "./calendar-button";

async function getMonthlyStatus(probe: string) {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${probe}/monthly-status`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);
		if (!res.ok) {
			throw new Error("Failed to fetch monthly status");
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching monthly status:", error);
		return {};
	}
}

export default async function LogCalendar({ probe }: { probe: string }) {
	// use date in thailand timezone
	// const today = new Date();
	// const year = today.getFullYear();
	// const month = today.getMonth();
	const data: {
		skip: number;
		status: Record<string, "info" | "warning" | "error" | "no-data" | null>;
	} = await getMonthlyStatus(probe);

	const getStatusColor = (
		status: "info" | "warning" | "error" | "no-data" | null
	) => {
		if (!status) return "bg-transparent pointer-events-none";
		// const year = date.getFullYear();
		// const month = String(date.getMonth() + 1).padStart(2, "0");
		// const day = String(date.getDate()).padStart(2, "0");
		// const dateKey = `${year}-${month}-${day}`;

		// const status = data[dateKey];
		if (status === "error")
			return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] cursor-pointer";
		if (status === "warning")
			return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] cursor-pointer";
		if (status === "info") return "bg-emerald-500/80 cursor-pointer";
		return "bg-muted border pointer-events-none";
	};

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// counting empty slots for days before the 1st of the month
	// const today = new Date().toLocaleDateString("en-CA", {
	// 	timeZone: "Asia/Bangkok",
	// });
	// const [year, month] = today.split("-").map(Number);
	// const firstDayOfMonth = new Date(year, month - 1, 1);
	// const startingDay = firstDayOfMonth.getDay();
	// counting left days in month from today

	return (
		<div className="w-full h-full flex flex-col bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="flex justify-between items-center mb-4">
				<div className="grid grid-cols-7 w-full gap-1">
					{weekDays.map((d) => (
						<div
							key={d}
							className="text-center text-xs text-card-foreground uppercase font-semibold"
						>
							{d}
						</div>
					))}
				</div>
			</div>
			<div className="grid grid-cols-7 gap-2 flex-1 content-start">
				{Array.from({ length: data.skip }).map((_, i) => (
					<CalendarButton
						key={`empty-${i}`}
						date={null}
						color="bg-transparent"
					/>
				))}
				{Object.entries(data.status).map(([date, status], i) => (
					<CalendarButton
						key={i}
						date={new Date(date)}
						color={getStatusColor(status)}
					/>
				))}
			</div>
			<div className="flex flex-wrap items-center gap-4 mt-4 justify-end-safe text-xs text-secondary-foreground/70">
				<div className="flex items-center gap-1.5 shrink-0">
					<div className="w-2.5 h-2.5 rounded bg-emerald-500/80"></div> Healthy
				</div>
				<div className="flex items-center gap-1.5 shrink-0">
					<div className="w-2.5 h-2.5 rounded bg-amber-500"></div> Warning
				</div>
				<div className="flex items-center gap-1.5 shrink-0">
					<div className="w-2.5 h-2.5 rounded bg-rose-500"></div> Critical
				</div>
			</div>
		</div>
	);
}
