import { Pin, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { useEffect, useRef, useState } from "react";
import { Polygon } from "./geometry/polygon";

type Poi = { key: string; location: google.maps.LatLngLiteral };
const locations: Poi[] = [
	{ key: "pos-1", location: { lat: 13.846473, lng: 100.5667563 } },
	{ key: "pos-2", location: { lat: 13.8472767, lng: 100.568164 } },
	{ key: "pos-3", location: { lat: 13.8209738, lng: 100.563253 } },
	{ key: "pos-4", location: { lat: 13.8690081, lng: 100.562393 } },
	{ key: "pos-5", location: { lat: 13.8587568, lng: 100.5658246 } },
	{ key: "pos-6", location: { lat: 13.858761, lng: 100.565688 } },
	{ key: "pos-7", location: { lat: 13.852228, lng: 100.5708374 } },
	{ key: "pos-8", location: { lat: 13.8537375, lng: 100.5722569 } },
	{ key: "pos-9", location: { lat: 13.854167, lng: 100.5716387 } },
	{ key: "pos-10", location: { lat: 13.8536005, lng: 100.56092542 } },
	{ key: "pos-11", location: { lat: 13.859395, lng: 100.56198648 } },
	{ key: "pos-12", location: { lat: 13.8565445, lng: 100.5980808 } },
	{ key: "pos-13", location: { lat: 13.859627, lng: 100.582146 } },
	{ key: "pos-14", location: { lat: 13.85488, lng: 100.5887113 } },
	{ key: "pos-15", location: { lat: 13.8505523, lng: 100.5772205 } },
];

export const Cluster = () => {
	const map = useMap();
	const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
	const clusterer = useRef<MarkerClusterer | null>(null);

	const handleClick = (e: google.maps.MapMouseEvent) => {
		console.log("Map clicked at: ", e.latLng?.toString());
	};

	useEffect(() => {
		if (!map) return;
		if (!clusterer.current) {
			clusterer.current = new MarkerClusterer({ map });
		}
	}, [map]);

	useEffect(() => {
		if (!map || !clusterer.current) return;
		clusterer.current.clearMarkers();
		clusterer.current.addMarkers(Object.values(markers));
	}, [markers, map]);

	const setMarkerRef = (marker: Marker | null, key: string) => {
		if (marker && markers[key]) return;
		if (!marker && !markers[key]) return;

		setMarkers((prev) => {
			if (marker) {
				return { ...prev, [key]: marker };
			} else {
				const newMarkers = { ...prev };
				delete newMarkers[key];
				return newMarkers;
			}
		});
	};

	return (
		<>
			{locations.map((poi) => (
				<AdvancedMarker
					key={poi.key}
					position={poi.location}
					ref={(marker) => setMarkerRef(marker, poi.key)}
					clickable
					onClick={handleClick}
				>
					<Pin
						background={"#FBBC04"}
						glyphColor={"#000"}
						borderColor={"#000"}
					/>
				</AdvancedMarker>
			))}
		</>
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
