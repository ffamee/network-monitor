import { Download, Upload } from "lucide-react";

export const TrafficSplitBar = async ({
	buildingId,
}: {
	buildingId: string;
}) => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/influx/bandwidth/${buildingId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		throw new Error("Failed to fetch bandwidth data");
	}

	const data = await res.json();

	const download = data[0]?._value || 0;
	const upload = data[1]?._value || 0;

	const total = download + upload;
	const downPercent = (download / total) * 100;
	const upPercent = (upload / total) * 100;

	return (
		<div className="h-full flex flex-col justify-center">
			<div className="flex justify-between items-end mb-2">
				<div className="text-left">
					<div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
						<Download size={14} /> Download
					</div>
					<div className="text-2xl font-bold text-black dark:text-white">
						{download.toFixed(2)}{" "}
						<span className="text-sm text-card-foreground/75 font-normal">
							Mbps
						</span>
					</div>
				</div>
				<div className="text-right">
					<div className="flex items-center justify-end gap-2 text-blue-400 text-sm font-medium mb-1">
						Upload <Upload size={14} />
					</div>
					<div className="text-2xl font-bold text-black dark:text-white">
						{upload.toFixed(2)}{" "}
						<span className="text-sm text-card-foreground/75 font-normal">
							Mbps
						</span>
					</div>
				</div>
			</div>

			<div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex relative">
				<div
					className="h-full bg-primary transition-all duration-1000 ease-out flex items-center justify-start pl-2"
					style={{ width: `${downPercent}%` }}
				>
					{downPercent > 15 && (
						<span className="text-[10px] text-primary-foreground font-bold opacity-75">
							{Math.round(downPercent)}%
						</span>
					)}
				</div>
				<div className="w-0.5 h-full bg-slate-950 z-10"></div>
				<div
					className="h-full bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
					style={{ width: `${upPercent}%` }}
				>
					{upPercent > 15 && (
						<span className="text-[10px] text-blue-950 font-bold opacity-75">
							{Math.round(upPercent)}%
						</span>
					)}
				</div>
			</div>

			<div className="text-center mt-3 text-xs text-card-foreground/75">
				Total Bandwidth:{" "}
				<span className="text-card-foreground font-medium">
					{total > 1024 ? (total / 1024).toFixed(2) : total.toFixed(2)}{" "}
					{total > 1024 ? "Gbps" : "Mbps"}
				</span>
			</div>
		</div>
	);
};
