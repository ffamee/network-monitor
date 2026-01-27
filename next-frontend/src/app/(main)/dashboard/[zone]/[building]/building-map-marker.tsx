"use client";

import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

export default function BuildingMapMarker({
	position,
}: {
	position: google.maps.LatLngLiteral;
}) {
	return (
		<AdvancedMarker position={position}>
			<Pin />
		</AdvancedMarker>
	);
}
