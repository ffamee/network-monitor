"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function CurrentTime() {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	if (!currentTime) {
		return <div>Loading...</div>;
	}

	return (
		<div className="hidden sm:flex items-center gap-2 text-sm text-sidebar-accent-foreground bg-sidebar-accent px-3 py-1.5 rounded-lg border border-sidebar-ring">
			<Clock size={16} />
			<span className="font-mono">
				{currentTime.toLocaleTimeString("th-TH")}
			</span>
		</div>
	);
}
