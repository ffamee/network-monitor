"use client";

import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";

const rand = Array.from({ length: 40 }).map(
	() => Math.floor(Math.random() * 80) + 10
);

export default function BarChart() {
	const [throughputData, setThroughputData] = useState<number[]>(rand);

	useEffect(() => {
		// Simulate data slice every 3 seconds
		const interval = setInterval(() => {
			setThroughputData((prevData) => {
				const first = prevData[0];
				const newData = prevData.slice(1);
				newData.push(first);
				return newData;
			});
		}, 3000);

		return () => clearInterval(interval);
	}, []);
	return (
		<div className="col-span-1 md:col-span-2 lg:col-span-3 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="text-lg font-semibold text-card-foreground flex items-center gap-2">
				<div className="p-2 bg-primary rounded-lg">
					<Wifi size={18} className="text-card" />
				</div>
				Traffic Throughput (24h)
			</div>
			<div className="h-40 flex items-end justify-between gap-1 mt-4">
				{throughputData.map((h, i) => {
					return (
						<div
							key={i}
							className="w-full bg-chart-1 rounded-t transition-colors relative group opacity-70 hover:opacity-100"
							style={{ height: `${h}%` }}
						>
							<div className="absolute bottom-0 w-full bg-chart-2 h-1/2 rounded-t"></div>
						</div>
					);
				})}
			</div>
			<div className="flex justify-between text-xs text-secondary-foreground/70 mt-2 font-mono">
				<span>00:00</span>
				<span>06:00</span>
				<span>12:00</span>
				<span>18:00</span>
				<span>Now</span>
			</div>
		</div>
	);
}
