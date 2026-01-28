"use client";

import { useState, useEffect, useMemo } from "react";
import PanelControl from "./panel-control";
import { Layers } from "lucide-react";
import GoogleMap from "@/components/gl-map/google-map";
import { Cluster } from "@/components/gl-map/cluster/cluster";
import ZoneCard from "./zone-card";
import { useSearchParams } from "next/navigation";
import Lightbox from "./light-box";
import ZonePolygon from "./zone-polygon";
import { ImageInfo } from "@/models/image";
import { Zone } from "@/models/zone";
import { ProbeDetail } from "@/models/probe";
import { Slug } from "@/models/slug";

type ProbeMap = ProbeDetail & { building: Slug };
export type ZoneMap = Zone & { buildingCount: number } & { probes: ProbeMap[] };

export default function MapPage() {
	const [zone, setZone] = useState<ZoneMap[]>([]);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [visible, setVisible] = useState<{
		[key: string]: { polygon: boolean; pin: boolean };
	}>({});
	const searchParams = useSearchParams();
	const queryZone = searchParams.get("zone");

	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [lightboxImages, setLightboxImages] = useState<ImageInfo[]>([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [selectedZone, setSelectedZone] = useState<string | null>(queryZone);

	useEffect(() => {
		const fetchZones = async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/map`,
				{
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				},
			);
			const data = await response.json();
			// receive data from backend as Object
			setZone(data);
			setVisible(
				data.reduce(
					(
						acc: { [key: string]: { polygon: boolean; pin: boolean } },
						z: ZoneMap,
					) => {
						acc[z.name] = { polygon: true, pin: false };
						return acc;
					},
					{},
				),
			);
		};
		fetchZones();
	}, []);

	// console.log("map data:", zone);

	const toggleOpenPanel = () => {
		setIsPanelOpen((prev) => !prev);
	};

	const handleVisibilityChange = (z: string, type: "polygon" | "pin") => {
		setVisible((prev) => {
			const zone = prev[z];
			return { ...prev, [z]: { ...zone, [type]: !zone[type] } };
		});
	};

	const handleSetAllVisible = (type: "polygon" | "pin", value: boolean) => {
		setVisible((prev) => {
			const newVisible: { [key: string]: { polygon: boolean; pin: boolean } } =
				{};
			for (const z in prev) {
				newVisible[z] = { ...prev[z], [type]: value };
			}
			return newVisible;
		});
	};

	const handleLightbox = (images: ImageInfo[], index: number) => {
		setLightboxIndex(index);
		setLightboxImages(images);
		setIsLightboxOpen(true);
	};

	const handleCloseLightbox = () => {
		setIsLightboxOpen(false);
	};

	const filteredLocations = useMemo(() => {
		return zone.flatMap((z) => {
			const isPinVisible = visible[z.name]?.pin;
			return isPinVisible
				? z.probes.map((probe) => ({
						key: `${z.slug}/${probe.building.slug}/${probe.slug}`,
						location: {
							lat: probe.lat,
							lng: probe.lng,
						},
						color: z.color,
					}))
				: [];
		});
	}, [zone, visible]);

	return (
		<main className="w-full h-[calc(100%-4rem)] mt-16 overscroll-none">
			{/* <div className="w-full h-full bg-red-300" /> */}
			{/* Map Component */}
			<GoogleMap
				{...{
					props: {
						defaultZoom: 15,
						latLngBounds: {
							north: 13.88,
							south: 13.82,
							east: 100.62,
							west: 100.52,
						},
					},
				}}
			>
				<>
					{zone.map(
						(z) =>
							visible[z.name]?.polygon && (
								<ZonePolygon
									key={z.name}
									geojson={z.geojson}
									color={z.color}
									setSelectedZone={() => setSelectedZone(z.slug)}
								/>
							),
					)}
				</>
				<Cluster locations={filteredLocations} />
			</GoogleMap>

			{/* Panel Control & Toggle Button */}
			<div className="w-full">
				<PanelControl
					{...{
						isOpen: isPanelOpen,
						toggleOpenPanel,
						visible,
						setVisible: handleVisibilityChange,
						setAllVisible: handleSetAllVisible,
					}}
				/>
				{isPanelOpen && (
					<div
						className="mobile:hidden inset-0 bg-black/80 fixed fade-in z-30"
						onClick={(e: React.MouseEvent) => {
							if (e.target === e.currentTarget) {
								toggleOpenPanel();
							}
						}}
					/>
				)}
				{!isPanelOpen && (
					<button
						title="เปิดแผงควบคุมเลเยอร์"
						onClick={toggleOpenPanel}
						className="absolute top-20 right-4 z-10 aspect-square
												p-1.5 bg-secondary hover:bg-primary rounded-lg text-primary hover:text-secondary transition-colors border border-primary"
					>
						<Layers size={18} />
					</button>
				)}
			</div>

			{/* Zone Card Info */}
			<ZoneCard selectedZone={selectedZone} setLightbox={handleLightbox} />
			<Lightbox
				isOpen={isLightboxOpen}
				images={lightboxImages}
				initialIndex={lightboxIndex}
				onClose={handleCloseLightbox}
				setIndex={setLightboxIndex}
			/>
		</main>
	);
}
