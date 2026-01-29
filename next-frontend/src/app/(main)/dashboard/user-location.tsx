"use client";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
export default function UserLocationMap() {
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const map = useMap();
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
					map?.setZoom(18);
					map?.panTo({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error getting user location:", error);
				},
			);
		} else {
			console.error("Geolocation is not supported by this browser.");
		}
	}, [map]);

	if (!map || !userLocation) {
		return null;
	}

	return <AdvancedMarker position={userLocation} />;
}
