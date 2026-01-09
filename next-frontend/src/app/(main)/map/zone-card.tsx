"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import ImageGrid from "./image-grid";
import { LaptopMinimal, Server } from "lucide-react";

type ZoneInfo = {
	name: string;
	color: string;
	locations: { key: string; location: google.maps.LatLngLiteral }[];
	images: string[];
};

interface ZoneCardProps {
	selectedZone: string | null;
	setLightbox: (images: string[], index: number) => void;
}

export default function ZoneCard(props: ZoneCardProps) {
	const [loading, setLoading] = useState(false);
	const [zoneData, setZoneData] = useState<ZoneInfo | null>(null);

	useEffect(() => {
		const fetchZoneInfo = async () => {
			if (!props.selectedZone) {
				setZoneData(null);
				return;
			}
			setLoading(true);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${props.selectedZone}`,
					{
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				);
				if (response.ok) {
					const data = await response.json();
					setZoneData(data);
				} else {
					throw new Error("Failed to fetch zone info");
				}
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchZoneInfo();
	}, [props.selectedZone]);

	if (loading) {
		return (
			<div
				className="absolute left-4 top-20 bottom-4 bg-popover w-full max-w-[clamp(20rem,50vw,24rem)] rounded-2xl overflow-y-auto overscroll-none no-scrollbar
									space-y-4 pb-4"
			>
				<Skeleton className="h-[40dvh] max-h-96 w-full rounded-t-2xl" />
				<Skeleton className="h-8 w-3/4 mx-4 rounded" />
				<Skeleton className="h-4 w-5/6 mx-4 rounded" />
				<Skeleton className="h-4 w-2/3 mx-4 rounded" />
				<div className="mx-4 grid grid-cols-2 space-x-2 space-y-4">
					<Skeleton className="h-16 col-span-2 rounded" />
					<Skeleton className="h-12 rounded" />
					<Skeleton className="h-12 rounded" />
				</div>
				<Skeleton className="h-8 w-3/4 mx-4 rounded" />
				<Skeleton className="h-4 w-5/6 mx-4 rounded" />
				<Skeleton className="h-4 w-2/3 mx-4 rounded" />
			</div>
		);
	}

	if (zoneData === null) {
		return null;
	}

	return (
		<div
			className="absolute left-4 top-20 bottom-4 bg-popover w-full max-w-[clamp(20rem,50vw,24rem)] rounded-2xl overflow-y-auto overscroll-none no-scrollbar
									space-y-4 pb-4"
		>
			<div className="h-auto">
				<ImageGrid images={zoneData.images} show={props.setLightbox} />
			</div>
			<div className="px-4 space-y-4">
				<div className="text-lg font-semibold">
					{zoneData.name}
					<span className="text-xs font-normal text-muted-foreground line-clamp-2 hover:line-clamp-none">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum ad
						eum porro quod cupiditate, veniam exercitationem illo quasi in
						aliquam, error quidem ratione! Earum fugit unde doloremque aut
						inventore. Vitae?
					</span>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div className="bg-secondary p-3 rounded-lg border border-ring hover:border-primary/75 hover:border-2 transition-colors">
						<div className="flex items-center gap-2 mb-1">
							<Server size={14} className="text-primary" />
							<span className="text-xs text-card-foreground/75">
								จำนวนอาคาร
							</span>
						</div>
						<div className="text-lg font-semibold text-secondary-foreground/75">
							{Math.round(zoneData.locations.length / 3)}
							<span className="text-sm font-normal text-card-foreground/75 mx-2">
								ชั้น
							</span>
						</div>
					</div>
					<div className="bg-secondary p-3 rounded-lg border border-ring hover:border-primary/75 hover:border-2 transition-colors">
						<div className="flex items-center gap-2 mb-1">
							<LaptopMinimal size={14} className="text-primary" />
							<span className="text-xs text-card-foreground/75">
								จำนวนจุดติดตั้ง
							</span>
						</div>
						<div className="text-lg font-semibold text-secondary-foreground/75">
							{zoneData.locations.length}
							<span className="text-sm font-normal text-card-foreground/75 mx-2">
								ตัว
							</span>
						</div>
					</div>
					<div className="col-span-2 bg-secondary p-3 rounded-lg border border-ring hover:border-primary/75 hover:border-2 transition-colors">
						chart
					</div>
				</div>
				<div>
					<div className="mb-2 text-sm font-semibold flex items-center">
						<LaptopMinimal
							size={16}
							className="inline-block mr-2 text-primary"
						/>
						Attached Devices
					</div>
					<div className="grid gap-2">
						{zoneData.locations.map((loc, index) => {
							const color = ["bg-rose-400", "bg-emerald-400", "bg-amber-400"][
								index % 3
							];
							return (
								<div
									key={loc.key}
									className="bg-muted rounded-lg p-2 text-sm text-secondary-foreground justify-between flex items-center border hover:border-ring
														transition-colors cursor-pointer"
								>
									<div className="flex items-center gap-2">
										<div
											className={`size-2 ${color} shadow-2xl rounded-full`}
										/>
										{loc.key}
									</div>
									<div className="text-xs text-secondary-foreground/50">
										192.168.1.1
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
