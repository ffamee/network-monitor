"use client";

import { useRef, useState } from "react";
import EditBuildingMap from "./edit-building-map";
import { PlaceHandler } from "@/components/gl-map/map-place";
import { LocationInfo } from "@/app/(action)/add/building/[slug]/page";
import { ProbeEditForm } from "./edit-probe-form";
import { Probe } from "@/models/probe";
import { Slug } from "@/models/slug";

interface EditBuildingPageProps {
	probeId: string;
	probe: Probe & { building: Slug };
	buildings: {
		id: number;
		name: string;
		buildings: { id: number; name: string }[];
	}[];
}

export default function EditBuildingComponentPage({
	probeId,
	probe,
	buildings,
}: EditBuildingPageProps) {
	const [location, setLocation] = useState<LocationInfo>({
		lat: probe.lat,
		lng: probe.lng,
		...(probe.googlePlaceId && { placeId: probe.googlePlaceId }),
		...(probe.address && { address: probe.address }),
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
			<div className="py-4 w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<ProbeEditForm
					{...{ probeId, probe, location, fetchPlace, buildings }}
				/>
			</div>
		</div>
	);
}
