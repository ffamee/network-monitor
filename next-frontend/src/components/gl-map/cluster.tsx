import { Pin, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useState } from "react";

type Location = {
	key: string;
	location: google.maps.LatLngLiteral;
	color?: string;
};

export const Cluster = ({ locations }: { locations: Location[] }) => {
	const map = useMap();
	const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
	// const clusterer = useRef<MarkerClusterer | null>(null);
	const clusterer = useMemo(() => {
		if (!map) return null;
		return new MarkerClusterer({ map });
	}, [map]);

	// const handleClick = (e: google.maps.MapMouseEvent) => {
	// 	console.log("Map clicked at: ", e.latLng?.toString());
	// };

	// useEffect(() => {
	// 	if (!map) return;
	// 	if (!clusterer.current) {
	// 		clusterer.current = new MarkerClusterer({ map });
	// 	}
	// }, [map]);

	useEffect(() => {
		if (!clusterer) return;
		clusterer.clearMarkers();
		clusterer.addMarkers(Object.values(markers));
	}, [clusterer, markers]);

	const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
		// if (marker && markers.current[key]) return;
		// if (!marker && !markers.current[key]) return;

		// setMarkers((prev) => {
		// 	if (marker) {
		// 		return { ...prev, [key]: marker };
		// 	} else {
		// 		const newMarkers = { ...prev };
		// 		delete newMarkers[key];
		// 		return newMarkers;
		// 	}
		// });
		setMarkers((prev) => {
			if ((marker && prev[key]) || (!marker && !prev[key])) return prev;

			if (marker) {
				return { ...prev, [key]: marker };
			} else {
				const { [key]: _, ...newMarkers } = prev;
				return newMarkers;
			}
		});
	}, []);

	return (
		<>
			{locations.map((poi) => (
				// <AdvancedMarker
				// 	key={poi.key}
				// 	position={poi.location}
				// 	ref={(marker) => setMarkerRef(marker, poi.key)}
				// 	clickable
				// 	onClick={handleClick}
				// >
				// 	<Pin
				// 		background={"#FBBC04"}
				// 		glyphColor={"#000"}
				// 		borderColor={"#000"}
				// 	/>
				// </AdvancedMarker>
				<CustomMarker
					key={poi.key}
					name={poi.key}
					position={poi.location}
					setMarkerRef={setMarkerRef}
					color={poi?.color}
				/>
			))}
		</>
	);
};

const CustomMarker = (props: {
	name: string;
	position: google.maps.LatLngLiteral;
	setMarkerRef: (marker: Marker | null, key: string) => void;
	color?: string;
}) => {
	const { name, position, setMarkerRef } = props;
	const ref = useCallback(
		(marker: google.maps.marker.AdvancedMarkerElement) =>
			setMarkerRef(marker, name),
		[setMarkerRef, name]
	);

	const { background, borderColor, glyphColor } = generatePinColors(
		props.color
	);

	return (
		<AdvancedMarker position={position} ref={ref} clickable>
			<Pin
				background={background}
				glyphColor={glyphColor}
				borderColor={borderColor}
			/>
		</AdvancedMarker>
	);
};

const generatePinColors = (baseColor?: string) => {
	if (!baseColor) {
		return {
			background: undefined,
			borderColor: undefined,
			glyphColor: undefined,
		};
	}

	const lighten = (color: string, percent: number) => {
		const num = parseInt(color.replace("#", ""), 16),
			amt = Math.round(2.55 * percent),
			R = (num >> 16) + amt,
			B = ((num >> 8) & 0x00ff) + amt,
			G = (num & 0x0000ff) + amt;
		return (
			"#" +
			(
				0x1000000 +
				(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
				(B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
				(G < 255 ? (G < 1 ? 0 : G) : 255)
			)
				.toString(16)
				.slice(1)
		);
	};

	const darken = (color: string, percent: number) => {
		const num = parseInt(color.replace("#", ""), 16),
			amt = Math.round(2.55 * percent),
			R = (num >> 16) - amt,
			B = ((num >> 8) & 0x00ff) - amt,
			G = (num & 0x0000ff) - amt;
		return (
			"#" +
			(
				0x1000000 +
				(R > 0 ? R : 0) * 0x10000 +
				(B > 0 ? B : 0) * 0x100 +
				(G > 0 ? G : 0)
			)
				.toString(16)
				.slice(1)
		);
	};

	return {
		background: lighten(baseColor, 20), // จางลง 40% (สีอ่อน)
		borderColor: baseColor, // สีเดิม (สีกลาง)
		glyphColor: darken(baseColor, 40), // เข้มขึ้น 40% (สีเข้ม)
	};
};
