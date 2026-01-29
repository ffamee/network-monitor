import { BuildingWithProbesCount } from "@/models/building";
import { LayoutGrid } from "lucide-react";
import AddButton from "./add-button";
import Link from "next/link";
import BuildingCard from "./building-card";

interface BuildingListProps {
	zone: string;
	buildings: BuildingWithProbesCount[];
}

export default function BuildingList({ zone, buildings }: BuildingListProps) {
	if (buildings.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 w-full h-64 bg-card border border-ring rounded-2xl shadow-md">
				<p className="text-lg text-secondary-foreground mb-4">
					No buildings found in this zone.
				</p>
				<AddButton zone={zone} />
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-[clamp(1rem,4vw,1.5rem)] font-semibold text-foreground mb-4 flex items-center gap-2 justify-between">
				<div className="flex items-center gap-2">
					<LayoutGrid size={20} className="text-primary" />
					Buildings in this Zone
				</div>
				<AddButton zone={zone} />
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
				{buildings.map((building) => (
					<Link
						href={`/dashboard/${zone}/${building.slug}`}
						key={building.id}
						// onClick={() => onSelectBuilding(building.id)}
						className="group bg-card border border-ring/50 hover:border-primary hover:border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1"
					>
						<BuildingCard building={building} />
					</Link>
				))}
			</div>
		</div>
	);
}
