import {
	ArrowRight,
	Building,
	LaptopMinimal,
	LayoutGrid,
	Pencil,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ZoneData = {
	id: string;
	name: string;
	description: string;
	totalBuildings: number;
	totalProbes: number;
	images: string[];
};

async function getZoneData(zoneId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${zoneId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
	);
	if (!res.ok) {
		throw new Error("Failed to fetch zone data");
	}
	const data = await res.json();
	return data;
}

const buildings = [
	{
		id: 1,
		image:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
		name: "Building 1",
		slug: "building-1",
		totalProbes: 12,
	},
	{
		id: 2,
		image:
			"https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2668&auto=format&fit=crop",
		name: "Building 2",
		slug: "building-2",
		totalProbes: 8,
	},
	{
		id: 3,
		image:
			"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
		name: "Building 3",
		slug: "building-3",
		totalProbes: 15,
	},
	{
		id: 4,
		image:
			"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
		name: "Building 4",
		slug: "building-4",
		totalProbes: 13,
	},
	{
		id: 5,
		image:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
		name: "Building 5",
		slug: "building-5",
		totalProbes: 12,
	},
	{
		id: 6,
		image:
			"https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2668&auto=format&fit=crop",
		name: "Building 6",
		slug: "building-6",
		totalProbes: 8,
	},
	{
		id: 7,
		image:
			"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
		name: "Building 7",
		slug: "building-7",
		totalProbes: 15,
	},
	{
		id: 8,
		image:
			"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
		name: "Building 8",
		slug: "building-8",
		totalProbes: 13,
	},
];

export default async function ZonePage({
	params,
}: {
	params: Promise<{ zone: string }>;
}) {
	const { zone } = await params;
	const zoneData: ZoneData = await getZoneData(zone);
	const bgImage = zoneData.images.length ? zoneData.images[0] : undefined;
	return (
		<div className="min-h-full h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
			<main className="pt-24 pb-12 px-4 flex flex-col gap-4">
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Zone Header Info */}
					<div
						className={`relative rounded-3xl overflow-hidden h-64 border border-accent shadow-2xl`}
						style={{
							backgroundImage: `url(${bgImage})`,
							backgroundPosition: "right center",
							backgroundSize: "cover",
						}}
					>
						<div className="absolute inset-0 bg-linear-to-r from-stone-900 via-stone-900/80 to-transparent"></div>

						<div className="relative z-10 p-[clamp(1rem,4vw,2rem)] max-w-2xl justify-between flex flex-col h-full">
							<div className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white mb-2">
								<div className="flex items-center gap-4">
									{zoneData.name}
									<Link
										href={`/edit/zone/${zone}`}
										title="แก้ไขข้อมูลโซน"
										className="cursor-pointer text-accent/30 hover:text-primary/75 transition-colors text-[clamp(1rem,4vw,1.25rem)]"
									>
										<Pencil
											data-testid="edit-zone-info-trigger"
											className="w-[1em] h-[1em]"
										/>
									</Link>
								</div>
								<p className="text-white/70 text-[clamp(0.875rem,2vw,1rem)] font-normal leading-relaxed">
									{zoneData.description}
								</p>
							</div>

							<div className="flex items-center gap-6 mt-6">
								<div className="flex items-center gap-4">
									<div className="p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700">
										<Building size={20} />
									</div>
									<div>
										<div className="text-2xl font-bold text-white">
											{zoneData.totalBuildings}
										</div>
										<div className="text-xs text-slate-500">Buildings</div>
									</div>
								</div>
								<div className="w-px h-10 bg-slate-800"></div>
								<div className="flex items-center gap-4">
									<div className="p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700">
										<LaptopMinimal size={20} />
									</div>
									<div>
										<div className="text-2xl font-bold text-white">
											{zoneData.totalProbes}
										</div>
										<div className="text-xs text-slate-500">Active Probes</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Buildings Grid */}
					<div>
						<h3 className="text-[clamp(1.25rem,4vw,1.5rem)] font-semibold text-foreground mb-4 flex items-center gap-2">
							<LayoutGrid size={20} className="text-primary" />
							Buildings in this Zone
						</h3>
						<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
							{buildings.map((building) => (
								<Link
									href={`/dashboard/${zone}/${building.slug}`}
									key={building.id}
									// onClick={() => onSelectBuilding(building.id)}
									className="group bg-card border border-ring/50 hover:border-primary rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1"
								>
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
								</Link>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
