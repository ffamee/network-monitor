export const formatFeatureCollections = (geojson: GeoJSON.Geometry) => {
	if (geojson.type !== "MultiPolygon") {
		return "";
	}
	return {
		type: "FeatureCollection",
		features: geojson.coordinates.map((polygon) => ({
			type: "Feature",
			properties: { mode: "polygon", selected: false },
			geometry: {
				type: "Polygon",
				coordinates: polygon,
			},
		})),
	};
};

export const formatTimeAgo = (timestamp: Date) => {
	const now = new Date();
	const past = new Date(timestamp);
	const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
	if (diffInSeconds < 60) {
		return `${diffInSeconds} seconds ago`;
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minutes ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hours ago`;
	}
	const days = Math.floor(diffInSeconds / 86400);
	return `${days} days ago`;
};
