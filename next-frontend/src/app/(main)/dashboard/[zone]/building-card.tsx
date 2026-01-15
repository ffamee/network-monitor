import { ArrowRight, LaptopMinimal } from "lucide-react";
import Image from "next/image";

export default function BuildingCard({
	building,
}: {
	building: { image: string; name: string; totalProbes: number };
}) {
	return (
		<>
			<div className="h-40 relative overflow-hidden">
				<Image
					src={building.image}
					alt={building.name}
					fill
					className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-stone-900 via-transparent to-transparent opacity-80"></div>
				{/* <div className="absolute top-3 right-3">
										<StatusBadge status={building.status} />
									</div> */}
			</div>
			<div className="p-5">
				<div className="text-lg font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
					{building.name}
				</div>
				<p className="text-xs text-secondary-foreground/60 mb-4 line-clamp-1">
					{/* {building.description} */}
					abc
				</p>

				<div className="flex items-center justify-between pt-4 border-t border-secondary-foreground/30">
					<div className="flex items-center gap-2 text-xs text-secondary-foreground/80">
						<LaptopMinimal size={14} className="text-emerald-500" />
						{building.totalProbes} Probes
					</div>
					<div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-secondary-foreground group-hover:bg-primary group-hover:text-white transition-all">
						<ArrowRight size={14} />
					</div>
				</div>
			</div>
		</>
	);
}
