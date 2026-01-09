"use client";

import { useState, useEffect, useMemo } from "react";
import PanelControl from "./panel-control";
import { Layers } from "lucide-react";
import GoogleMap from "@/components/gl-map/google-map";
import { Polygon } from "@/components/gl-map/geometry/polygon";
import { Cluster } from "@/components/gl-map/cluster";

type Poi = { key: string; location: google.maps.LatLngLiteral };

type ZoneInfo = {
	name: string;
	color: string;
	paths: google.maps.LatLngLiteral[];
	locations: Poi[];
};

export default function MapPage() {
	const [zone, setZone] = useState<ZoneInfo[]>([]);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [visible, setVisible] = useState<{
		[key: string]: { polygon: boolean; pin: boolean };
	}>({});

	useEffect(() => {
		const fetchZones = async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone`,
				{
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			// const data = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];
			const data = await response.json();
			// receive data from backend as Object
			setZone(data);
			setVisible(
				data.reduce(
					(
						acc: { [key: string]: { polygon: boolean; pin: boolean } },
						z: ZoneInfo
					) => {
						acc[z.name] = { polygon: true, pin: false };
						return acc;
					},
					{}
				)
			);
		};
		fetchZones();
	}, []);

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

	const filteredLocations = useMemo(() => {
		return zone.flatMap((z) => {
			const isPinVisible = visible[z.name]?.pin;
			return isPinVisible
				? z.locations.map((location) => ({ ...location, color: z.color }))
				: [];
		});
	}, [zone, visible]);

	return (
		<main className="w-full h-[calc(100%-4rem)] mt-16">
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
								<Polygon
									key={z.name}
									paths={z.paths}
									strokeColor={z.color}
									fillColor={z.color}
								/>
							)
					)}
				</>
				<Cluster locations={filteredLocations} />
			</GoogleMap>
			<div className="hidden sm:block absolute top-20 right-4 z-50">
				{isPanelOpen ? (
					<PanelControl
						{...{
							toggleOpenPanel,
							visible,
							setVisible: handleVisibilityChange,
							setAllVisible: handleSetAllVisible,
						}}
					/>
				) : (
					<button
						title="เปิดแผงควบคุมเลเยอร์"
						onClick={toggleOpenPanel}
						className="p-1.5 bg-secondary hover:bg-primary rounded-lg text-primary hover:text-secondary transition-colors border border-primary"
					>
						<Layers size={18} />
					</button>
				)}
			</div>
		</main>
	);
}
