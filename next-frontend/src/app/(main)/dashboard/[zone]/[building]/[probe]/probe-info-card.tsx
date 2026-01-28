import { ProbeDetail } from "@/models/probe";
import { Cpu } from "lucide-react";

interface ProbeInfoCardProps {
	probe: ProbeDetail;
}

export default function ProbeInfoCard({ probe }: ProbeInfoCardProps) {
	return (
		<div className="col-span-1 row-span-2 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="text-[clamp(1rem,2vw,1.125rem)] font-semibold text-card-foreground flex items-center gap-2 mb-4">
				<Cpu size={20} className="text-primary" />
				Device Information
			</div>
			<div className="space-y-4 mt-2">
				{[
					// { label: "Model", value: probe.model },
					{ label: "Model", value: "B1 Pro" },
					{ label: "Serial No.", value: probe.serialNumber },
					{ label: "MAC Address", value: probe.macAddress || "N/A" },
					{
						label: "Installed",
						value: new Date(probe.createdAt).toLocaleDateString("en-CA", {
							timeZone: "Asia/Bangkok",
						}),
					},
					{
						label: "Last Update",
						value: new Date(probe.updatedAt).toLocaleDateString("en-CA", {
							timeZone: "Asia/Bangkok",
						}),
					},
				].map((item, i) => (
					<div
						key={i}
						className="pb-3 border-b border-ring last:border-0 last:pb-0"
					>
						<div className="text-xs text-stone-500 mb-1">{item.label}</div>
						<div className="text-sm font-medium text-card-foreground wrap-break-words">
							{item.value}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
