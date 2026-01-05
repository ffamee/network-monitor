"use client";

import { APIProvider, Map, ColorScheme } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { Cluster, TestPolygon } from "./cluster";

export default function GoogleMap() {
	const API_KEY =
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? GOOGLE_MAPS_API_KEY;

	const { resolvedTheme } = useTheme();

	const colorScheme = resolvedTheme
		? resolvedTheme === "dark"
			? ColorScheme.DARK
			: ColorScheme.LIGHT
		: ColorScheme.FOLLOW_SYSTEM;

	return (
		<div className="w-dvw max-w-full max-h-full aspect-square">
			<APIProvider apiKey={API_KEY} onLoad={() => console.log("Load map...")}>
				<Map
					reuseMaps={true}
					mapId={"358498466570083911ca77a2"}
					colorScheme={colorScheme}
					defaultZoom={15}
					minZoom={14}
					defaultCenter={{ lat: 13.85003, lng: 100.57099 }}
					gestureHandling={"greedy"}
					disableDefaultUI={true}
					restriction={{
						latLngBounds: {
							north: 13.875,
							south: 13.83,
							east: 100.6,
							west: 100.55,
						},
						strictBounds: true,
					}}
					onClick={(e) => console.log(e)}
				>
					<Cluster />
					<TestPolygon />
				</Map>
			</APIProvider>
		</div>
	);
}
