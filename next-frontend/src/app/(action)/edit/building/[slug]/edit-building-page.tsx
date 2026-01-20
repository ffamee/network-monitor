"use client";

import { useRef, useState } from "react";
import EditBuildingMap from "./edit-building-map";
import { BuildingEditForm } from "./edit-building-form";
import { PlaceHandler } from "@/components/gl-map/map-place";
import { LocationInfo } from "@/app/(action)/add/building/[slug]/page";

interface EditBuildingPageProps {
	slug: string;
	building: {
		name: string;
		lat: number;
		lng: number;
		placeId: string | null;
		address: string;
		floor?: number;
		admin?: string;
		tel?: string;
		// other building properties...
	};
}

export default function EditBuildingComponentPage({
	slug,
	building,
}: EditBuildingPageProps) {
	const [location, setLocation] = useState<LocationInfo>({
		lat: building.lat,
		lng: building.lng,
		...(building.placeId && { placeId: building.placeId }),
		...(building.address && { address: building.address }),
	});
	const mapRef = useRef<PlaceHandler>(null);

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
			<EditBuildingMap onLocationSelect={setLocation} ref={mapRef} />
			<div className="py-4 md:py-0 w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<BuildingEditForm {...{ slug, building, location, fetchPlace }} />
			</div>
		</div>
	);
}
