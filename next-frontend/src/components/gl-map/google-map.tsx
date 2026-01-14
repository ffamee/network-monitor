"use client";

import { APIProvider, Map, ColorScheme } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface GoogleMapProps {
	className?: string;
	defaultZoom?: number;
	minZoom?: number;
	defaultCenter?: { lat: number; lng: number };
	latLngBounds?: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
	clickableIcons?: boolean;
}

export default function GoogleMap({
	props,
	children,
}: {
	props?: GoogleMapProps;
	children?: React.ReactNode;
}) {
	const API_KEY =
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? GOOGLE_MAPS_API_KEY;

	const { resolvedTheme } = useTheme();

	const colorScheme = resolvedTheme
		? resolvedTheme === "dark"
			? ColorScheme.DARK
			: ColorScheme.LIGHT
		: ColorScheme.FOLLOW_SYSTEM;

	return (
		<div className={cn("w-dvw max-w-full h-full max-h-full", props?.className)}>
			<APIProvider apiKey={API_KEY} onLoad={() => console.log("Load map...")}>
				<Map
					reuseMaps={true}
					mapId={"358498466570083911ca77a2"}
					colorScheme={colorScheme}
					defaultZoom={props?.defaultZoom ?? 15}
					minZoom={props?.minZoom ?? 14}
					defaultCenter={
						props?.defaultCenter ?? { lat: 13.85003, lng: 100.57099 }
					}
					gestureHandling={"greedy"}
					disableDefaultUI={true}
					restriction={{
						latLngBounds: props?.latLngBounds ?? {
							north: 13.875,
							south: 13.83,
							east: 100.6,
							west: 100.55,
						},
						strictBounds: true,
					}}
					clickableIcons={props?.clickableIcons ?? false}
					onClick={(e) => console.log(e)}
				>
					{children}
				</Map>
			</APIProvider>
		</div>
	);
}
