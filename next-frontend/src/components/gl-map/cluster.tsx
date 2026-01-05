import { Pin, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Polygon } from "./geometry/polygon";

type Poi = { key: string; location: google.maps.LatLngLiteral };
const locations: Poi[] = [
	{ key: "poi-1", location: { lat: 13.8515, lng: 100.572 } },
	{ key: "poi-2", location: { lat: 13.852, lng: 100.575 } },
	{ key: "poi-3", location: { lat: 13.853, lng: 100.578 } },
	{ key: "poi-4", location: { lat: 13.854, lng: 100.579 } },
	{ key: "poi-5", location: { lat: 13.855, lng: 100.574 } },
	{ key: "poi-6", location: { lat: 13.856, lng: 100.571 } },
	{ key: "poi-7", location: { lat: 13.857, lng: 100.577 } },
	{ key: "poi-8", location: { lat: 13.858, lng: 100.573 } },
	{ key: "poi-9", location: { lat: 13.859, lng: 100.576 } },
	{ key: "poi-10", location: { lat: 13.8545, lng: 100.5725 } },
	{ key: "poi-11", location: { lat: 13.8518, lng: 100.578 } },
	{ key: "poi-12", location: { lat: 13.8525, lng: 100.571 } },
	{ key: "poi-13", location: { lat: 13.8535, lng: 100.575 } },
	{ key: "poi-14", location: { lat: 13.8565, lng: 100.579 } },
	{ key: "poi-15", location: { lat: 13.8575, lng: 100.573 } },
	{ key: "poi-16", location: { lat: 13.8585, lng: 100.577 } },
	{ key: "poi-17", location: { lat: 13.8555, lng: 100.574 } },
	{ key: "poi-18", location: { lat: 13.8595, lng: 100.571 } },
	{ key: "poi-19", location: { lat: 13.8542, lng: 100.576 } },
	{ key: "poi-20", location: { lat: 13.8532, lng: 100.572 } },
];

export const Cluster = () => {
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
				/>
			))}
		</>
	);
};

const CustomMarker = (props: {
	name: string;
	position: google.maps.LatLngLiteral;
	setMarkerRef: (marker: Marker | null, key: string) => void;
}) => {
	const { name, position, setMarkerRef } = props;
	const ref = useCallback(
		(marker: google.maps.marker.AdvancedMarkerElement) =>
			setMarkerRef(marker, name),
		[setMarkerRef, name]
	);
	return (
		<AdvancedMarker position={position} ref={ref} clickable>
			<Pin />
		</AdvancedMarker>
	);
};

const defaultPaths = [
	{ lat: 13.85003, lng: 100.57099 },
	{ lat: 13.86003, lng: 100.57099 },
	{ lat: 13.86003, lng: 100.58099 },
	{ lat: 13.85003, lng: 100.58099 },
];

export const TestPolygon = () => {
	return <Polygon paths={defaultPaths}></Polygon>;
};
