"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import ImageGrid from "./image-grid";
import {
	ChevronDown,
	ImageOff,
	LaptopMinimal,
	Server,
	SquareArrowOutUpRight,
} from "lucide-react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "usehooks-ts";
import Image from "next/image";
import Link from "next/link";
import { ImageInfo } from "@/models/image";
import { getIdFromSlug } from "@/lib/slug";
import { ZoneMap } from "./page";

interface ZoneCardProps {
	selectedZone: string | null;
	setLightbox: (images: ImageInfo[], index: number) => void;
}

export default function ZoneCard(props: ZoneCardProps) {
	const [loading, setLoading] = useState(false);
	const [zoneData, setZoneData] = useState<ZoneMap | null>(null);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const isMobile = useMediaQuery(`(max-width: 480px)`);
	const snapPoints = [
		typeof window !== "undefined" ? `${window.innerHeight * 0.3 + 80}px` : 0,
		1,
	];
	const [snap, setSnap] = useState<string | number | null>(snapPoints[0]);

	useEffect(() => {
		const fetchZoneInfo = async () => {
			if (!props.selectedZone) {
				setZoneData(null);
				return;
			}
			const zoneId = getIdFromSlug(props.selectedZone);
			if (!zoneId || isNaN(Number(zoneId))) {
				setZoneData(null);
				return;
			}
			setLoading(true);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/map/${zoneId}`,
					{
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					},
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

	if (!isMobile) {
		if (loading) {
			if (isCollapsed) {
				return (
					<div
						className="absolute left-4 top-20 bg-popover w-full max-w-[clamp(20rem,50vw,24rem)] rounded-2xl overflow-y-auto overscroll-none no-scrollbar
									space-y-4 pb-4"
					>
						<Skeleton className="h-12 w-3/4 mx-4 rounded" />
						<Skeleton className="h-8 w-3/4 mx-4 rounded" />
						<Skeleton className="h-4 w-5/6 mx-4 rounded" />
						<Skeleton className="h-4 w-2/3 mx-4 rounded" />
					</div>
				);
			}
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
	}

	if (zoneData === null) {
		return null;
	}

	if (isMobile) {
		return (
			<Drawer
				open={true} // บังคับเปิด
				modal={false} // สำคัญ! บอกว่าอย่าไป Block ฉากหลัง
				dismissible={false} // ห้ามปิด
				snapPoints={snapPoints}
				activeSnapPoint={snap}
				setActiveSnapPoint={setSnap}
			>
				<DrawerContent className="before:inset-0 z-20 h-full max-h-[70vh]!">
					<div className={snap === 1 ? "overflow-y-auto" : "overflow-hidden"}>
						<DrawerHeader
							className={"h-auto py-2" + (snap === 1 ? " *:text-left" : "")}
						>
							<DrawerTitle className="text-2xl space-y-2">
								{loading ? (
									<Skeleton className="h-8 w-3/4 rounded" />
								) : (
									<div className="flex items-center gap-4">
										{zoneData.name}
										<Link
											target="_blank"
											href={`/dashboard/${zoneData.slug}`}
											title={`ไปที่โซน${zoneData.name}`}
										>
											<SquareArrowOutUpRight
												size={16}
												className="text-secondary-foreground/50"
											/>
										</Link>
									</div>
								)}
								{loading ? (
									<Skeleton className="h-6 w-5/6 rounded" />
								) : (
									<span className="text-sm font-normal text-muted-foreground line-clamp-2">
										{zoneData.description || ""}
									</span>
								)}
							</DrawerTitle>
							<DrawerDescription className="sr-only">
								{zoneData.name} Information Card
							</DrawerDescription>
						</DrawerHeader>
						<DrawerFooter className="space-y-4">
							{loading ? (
								<>
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
								</>
							) : (
								<>
									<div>
										{zoneData.images.length > 0 ? (
											<div className="flex flex-row gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory h-60">
												{zoneData.images.map((src, index) => (
													<Image
														key={index}
														src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${src.url}`}
														alt={`img-${index}`}
														width={400}
														height={400}
														unoptimized={process.env.NODE_ENV == "development"}
														className="object-cover hover:opacity-90 transition-opacity cursor-pointer rounded-lg aspect-auto w-auto h-full snap-start snap-always"
														onClick={() =>
															props.setLightbox(zoneData.images, index)
														}
													/>
												))}
											</div>
										) : (
											<div className="flex flex-col gap-4 text-muted-foreground bg-accent items-center justify-center h-60 border overflow-hidden w-full">
												<ImageOff className="w-12 h-12" />
												No Images Available
											</div>
										)}
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
												{zoneData.buildingCount}
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
												{zoneData.probes.length}
												<span className="text-sm font-normal text-card-foreground/75 mx-2">
													ตัว
												</span>
											</div>
										</div>
									</div>
									<div className="">
										<div className="mb-2 text-sm font-semibold flex items-center">
											<LaptopMinimal
												size={16}
												className="inline-block mr-2 text-primary"
											/>
											Attached Devices
										</div>
										<div className="grid gap-2">
											{zoneData.probes.map((probe, index) => {
												return (
													<Link
														target="_blank"
														href={`/dashboard/${zoneData.slug}/${probe.building.slug}/${probe.slug}`}
														key={index}
														className="bg-muted rounded-lg p-2 text-sm text-secondary-foreground justify-between flex items-center border hover:border-ring
														transition-colors cursor-pointer"
													>
														<div className="flex items-center gap-2">
															<div
																className={`size-2 bg-green-500 shadow-2xl rounded-full`}
															/>
															{probe.name}
														</div>
														<div className="text-xs text-secondary-foreground/50">
															{probe.ipAddress || "N/A"}
														</div>
													</Link>
												);
											})}
										</div>
									</div>
								</>
							)}
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<div
			data-state={isCollapsed ? "collapsed" : "expanded"}
			className={`absolute left-4 top-20 bottom-auto bg-popover w-full max-w-[clamp(20rem,50vw,24rem)] rounded-2xl overflow-y-auto overscroll-none no-scrollbar
									space-y-4 pb-4 group transition-all ease-in-out duration-300 data-[state=expanded]:bottom-4 data-[state=collapsed]:pt-4`}
		>
			<button
				onClick={() => setIsCollapsed((prev) => !prev)}
				className="absolute top-4 right-4 text-white hover:scale-110 transition-transform p-2 bg-black/50 rounded-full z-10
										group-data-[state=expanded]:rotate-180"
			>
				<ChevronDown className="w-4 h-4" />
			</button>
			<div className="hidden group-data-[state=expanded]:block h-auto">
				<ImageGrid images={zoneData.images} show={props.setLightbox} />
			</div>
			<div className="text-lg font-semibold px-4 relative">
				<input type="checkbox" id="collapse-toggle" className="peer hidden" />
				<label
					htmlFor="collapse-toggle"
					className="cursor-pointer transition-colors *:line-clamp-2 peer-checked:*:line-clamp-none"
				>
					{zoneData.name}
					<br />
					<span className="text-xs font-normal text-muted-foreground">
						{zoneData.description || ""}
					</span>
				</label>
				<div className="absolute right-2 top-2 px-2 group-data-[state=collapsed]:hidden">
					<Link
						target="_blank"
						href={`/dashboard/${zoneData.slug}`}
						title={`ไปที่โซน${zoneData.name}`}
					>
						<SquareArrowOutUpRight
							size={16}
							className="text-secondary-foreground/50"
						/>
					</Link>
				</div>
			</div>
			<div className="hidden group-data-[state=expanded]:grid grid-cols-2 gap-2 px-4">
				<div className="bg-secondary p-3 rounded-lg border border-ring hover:border-primary/75 hover:border-2 transition-colors">
					<div className="flex items-center gap-2 mb-1">
						<Server size={14} className="text-primary" />
						<span className="text-xs text-card-foreground/75">จำนวนอาคาร</span>
					</div>
					<div className="text-lg font-semibold text-secondary-foreground/75">
						{zoneData.buildingCount}
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
						{zoneData.probes.length}
						<span className="text-sm font-normal text-card-foreground/75 mx-2">
							ตัว
						</span>
					</div>
				</div>
			</div>
			<div className="hidden group-data-[state=expanded]:block px-4">
				<div className="mb-2 text-sm font-semibold flex items-center">
					<LaptopMinimal size={16} className="inline-block mr-2 text-primary" />
					Attached Devices
				</div>
				<div className="grid gap-2">
					{zoneData.probes.map((probe, index) => {
						return (
							<Link
								target="_blank"
								href={`/dashboard/${zoneData.slug}/${probe.building.slug}/${probe.slug}`}
								key={index}
								className="bg-muted rounded-lg p-2 text-sm text-secondary-foreground justify-between flex items-center border hover:border-ring
														transition-colors cursor-pointer"
							>
								<div className="flex items-center gap-2">
									<div
										className={`size-2 bg-green-500 shadow-2xl rounded-full`}
									/>
									{probe.name}
								</div>
								<div className="text-xs text-secondary-foreground/50">
									{probe.ipAddress || "N/A"}
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
