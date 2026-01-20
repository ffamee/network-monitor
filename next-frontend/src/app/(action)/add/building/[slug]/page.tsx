"use client";
import { use, useRef, useState } from "react";
import { BuildingAddForm } from "./add-building-form";
import AddBuildingMap from "./add-building-map";
import { MapHandler } from "./map-place";

export type LocationInfo = {
	lat: number;
	lng: number;
	placeId?: string;
	address?: string; // ถ้ากด POI
	name?: string; // ถ้ากด POI
};

export default function AddBuildingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = use(params);
	const [location, setLocation] = useState<LocationInfo | null>(null);
	const mapRef = useRef<MapHandler>(null);
	// const zone = await fetch(
	// 	`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${slug}`,
	// 	{
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		credentials: "include",
	// 	}
	// ).then((res) => res.json());
	const fetchPlace = async () => {
		if (!mapRef.current) return;
		if (!location || !location.placeId) return;
		const place = await mapRef.current?.getPlaceDetails(location.placeId);
		if (!place) return;
		setLocation((prev) => ({ ...prev, ...place }));
		return;
	};

	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			<AddBuildingMap onLocationSelect={setLocation} ref={mapRef} />
			{/* {location && <pre>{JSON.stringify(location, null, 2)}</pre>} */}
			<div className="py-4 md:py-0 w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<BuildingAddForm {...{ zone: slug, location, fetchPlace }} />
			</div>
		</div>
	);
}
