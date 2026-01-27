"use client";

import { Zone } from "@/models/zone";
import { ZoneEditForm } from "./edit-zone-form";
import EditZoneMap from "./edit-zone-map";
import { useEffect, useState } from "react";
import { formatFeatureCollections } from "@/lib/formatter";

interface EditZonePageProps {
	zone: Zone;
	zoneId: string;
}

export default function EditZoneComponentPage({
	zone,
	zoneId,
}: EditZonePageProps) {
	const [paths, setPaths] = useState<string | null>(
		zone.geojson
			? JSON.stringify(formatFeatureCollections(zone.geojson))
			: null,
	);
	const [color, setColor] = useState<string>(zone.color);

	useEffect(() => {
		if (!paths) return;
		console.log("Raw paths:", paths);
		console.log("Paths updated:", JSON.parse(paths));
	}, [paths]);

	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			<EditZoneMap
				color={color}
				geojson={paths}
				onPathsChange={setPaths}
				onColorChange={setColor}
			/>
			<div className="py-4 w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<ZoneEditForm {...{ zone, paths, color, zoneId }} />
			</div>
		</div>
	);
}
