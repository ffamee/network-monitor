"use client";

import { APIProvider, Map, ColorScheme } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { Cluster, TestPolygon } from "./cluster";

export function GoogleMap() {
	const API_KEY =
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? GOOGLE_MAPS_API_KEY;

	const { resolvedTheme } = useTheme();

	const colorScheme = resolvedTheme
		? resolvedTheme === "dark"
			? ColorScheme.DARK
			: ColorScheme.LIGHT
		: ColorScheme.FOLLOW_SYSTEM;

	return (
		<div className="size-full">
			<APIProvider apiKey={API_KEY} onLoad={() => console.log("Load map...")}>
				<Map
					reuseMaps={true}
					mapId={"358498466570083911ca77a2"}
					colorScheme={colorScheme}
					defaultZoom={15}
					defaultCenter={{ lat: 13.85003, lng: 100.57099 }}
					gestureHandling={"greedy"}
					// disableDefaultUI={true}
					onClick={(e) => console.log(e)}
				>
					<Cluster />
					<TestPolygon />
				</Map>
			</APIProvider>
		</div>
	);
}
