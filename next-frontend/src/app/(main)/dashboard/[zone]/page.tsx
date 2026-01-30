import { Building, LaptopMinimal, Pencil } from "lucide-react";
import Link from "next/link";
import { ZoneNav } from "./zone-nav";
import { getIdFromSlug } from "@/lib/slug";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Zone } from "@/models/zone";
import Image from "next/image";
import type { BuildingWithProbesCount } from "@/models/building";
import BuildingList from "./building-list";

async function getZoneData(zoneId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${zoneId}/detail`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!res.ok) {
		if (res.status === 404) {
			return notFound();
		}
		throw new Error("Failed to fetch zone data");
	}
	const data = await res.json();
	return data;
}

export default async function ZonePage({
	params,
}: {
	params: Promise<{ zone: string }>;
}) {
	const { zone } = await params;

	const zoneId = getIdFromSlug(zone);
	if (!zoneId || isNaN(Number(zoneId))) notFound();
	const zoneData: Zone & { buildings: BuildingWithProbesCount[] } =
		await getZoneData(zoneId);

	if (!zoneData) notFound();
	if (zoneData.slug !== zone) {
		if (process.env.NODE_ENV === "development") {
			redirect(`${zoneData.slug}`);
		} else {
			permanentRedirect(`${zoneData.slug}`);
		}
	}

	console.log("zoneData:", zoneData);
	const probesCountInZone = zoneData.buildings.reduce(
		(acc, building) => acc + building.probeCount,
		0,
	);

	return (
		<div className="container mx-auto h-dvh overflow-y-auto no-scrollbar bg-background animate-in fade-in duration-500">
			<main className="pt-24 pb-12 px-4 flex flex-col gap-4">
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Zone Header Info */}
					<div
						className={`relative rounded-3xl overflow-hidden h-64 border border-accent shadow-md`}
					>
						{zoneData.images.length > 0 && (
							<Image
								src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${zoneData.images[0].url}`}
								alt="Zone Background Image"
								fill
								sizes="100vw"
								priority
								unoptimized={process.env.NODE_ENV === "development"}
								className="object-cover object-center w-full h-full"
							/>
						)}
						<div className="absolute inset-0 bg-linear-to-r from-stone-900 via-stone-900/80 to-transparent"></div>

						<div className="relative z-10 p-[clamp(1rem,4vw,2rem)] w-full justify-between flex flex-col h-full">
							<div className="flex justify-between w-full">
								<div className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white mb-2">
									<div className="flex items-center gap-4">
										{zoneData.name}
										<Link
											href={`/edit/zone/${zone}`}
											title="แก้ไขข้อมูลโซน"
											className="cursor-pointer text-white/50 hover:text-primary/75 transition-colors text-[clamp(1rem,4vw,1.25rem)]"
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
								<ZoneNav zone={zone} />
							</div>

							<div className="flex items-center gap-6 mt-6">
								<div className="flex items-center gap-4">
									<div className="p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700">
										<Building size={20} />
									</div>
									<div>
										<div className="text-2xl font-bold text-white">
											{zoneData.buildings.length}
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
											{probesCountInZone}
										</div>
										<div className="text-xs text-slate-500">Active Probes</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Buildings Grid */}
					<BuildingList zone={zone} buildings={zoneData.buildings} />
				</div>
			</main>
		</div>
	);
}
