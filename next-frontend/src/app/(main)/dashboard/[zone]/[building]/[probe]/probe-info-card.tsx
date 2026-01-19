import { Cpu } from "lucide-react";

export default function ProbeInfoCard({
	probe,
}: {
	probe: {
		model: string;
		serialNumber: string;
		mac: string;
		firmware: string;
		installDate: string;
	};
}) {
	return (
		<div className="col-span-1 row-span-2 bg-card p-4 rounded-2xl border border-ring shadow-md">
			<div className="text-[clamp(1rem,2vw,1.125rem)] font-semibold text-card-foreground flex items-center gap-2 mb-4">
				<Cpu size={20} className="text-primary" />
				Device Information
			</div>
			<div className="space-y-4 mt-2">
				{[
					{ label: "Model", value: probe.model },
					{ label: "Serial No.", value: probe.serialNumber },
					{ label: "MAC Address", value: probe.mac },
					{ label: "Firmware", value: probe.firmware },
					{ label: "Installed", value: probe.installDate },
					{ label: "Last Maintenance", value: "2 months ago" },
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
