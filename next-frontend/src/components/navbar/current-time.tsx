"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export default function CurrentTime() {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	if (!currentTime) {
		return (
			<Skeleton className="h-8 px-3 bg-muted border border-ring/50 text-muted-foreground/50 flex items-center justify-center rounded-lg gap-2">
				<Clock size={16} />
				00:00:00
			</Skeleton>
		);
	}

	return (
		<div className="hidden lg:flex items-center gap-2 text-sm text-sidebar-accent-foreground bg-sidebar-accent px-3 py-1.5 rounded-lg border border-sidebar-ring">
			<Clock size={16} />
			<span className="font-mono">
				{currentTime.toLocaleTimeString("th-TH")}
			</span>
		</div>
	);
}
