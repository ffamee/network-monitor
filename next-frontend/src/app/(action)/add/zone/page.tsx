"use client";

import { useState } from "react";
import AddZoneMap from "./add-zone-map";
import { ZoneAddForm } from "./add-zone-form";

export default function AddZonePage() {
	const [geojson, setGeojson] = useState<string | null>(null);
	const [color, setColor] = useState<string>("#000000");

	return (
		<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
			<AddZoneMap
				color={color}
				setColor={setColor}
				geojson={geojson}
				setGeojson={setGeojson}
			/>
			<div className="py-4 md:py-0 w-full h-full flex flex-col justify-center items-start gap-2 px-[clamp(16px,5vw,64px)] text-foreground">
				<ZoneAddForm {...{ color, geojson }} />
			</div>
		</div>
	);
}
