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
