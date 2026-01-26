// import { Polygon } from "@/components/gl-map/geometry/polygon";
// import { useMap } from "@vis.gl/react-google-maps";
// import { useMediaQuery } from "usehooks-ts";

// const formatGeoJson = (
// 	geojson: GeoJSON.Geometry,
// 	color: string,
// ): GeoJSON.Feature => {
// 	console.log("polygon color", color);
// 	return {
// 		type: "Feature",
// 		geometry: geojson,
// 		properties: {
// 			style: {
// 				stroke: color,
// 				"stroke-width": 1,
// 				"stroke-opacity": 1,
// 				fill: color,
// 				"fill-opacity": 0.5,
// 			},
// 		},
// 	};
// };

// export default function ZonePolygon(props: {
// 	geojson: GeoJSON.Geometry;
// 	color: string;
// 	setSelectedZone: () => void;
// }) {
// 	console.log("Rendering ZonePolygon with geojson:", props.geojson);
// 	const map = useMap();
// 	const isMobile = useMediaQuery(`(max-width: 480px)`);
// 	// const geo = JSON.parse(props.geojson);
// 	map?.data.addGeoJson(formatGeoJson(props.geojson, props.color));

// 	return null;
// 	// const handleClick = () => {
// 	// 	const bounds = new google.maps.LatLngBounds();
// 	// 	paths.forEach((path) => bounds.extend(path));
// 	// 	map?.fitBounds(bounds, isMobile ? 50 : 100);

// 	// 	props.setSelectedZone();
// 	// };

// 	// return (
// 	// 	<Polygon
// 	// 		paths={paths}
// 	// 		strokeColor={props.color}
// 	// 		fillColor={props.color}
// 	// 		onClick={handleClick}
// 	// 	/>
// 	// );
// }

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useMediaQuery } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";

// Helper function: คำนวณ Bounds จาก GeoJSON Geometry
const getBoundsFromGeoJson = (geometry: GeoJSON.Geometry) => {
	console.log("Calculating bounds for geometry:", geometry);
	const bounds = new google.maps.LatLngBounds();

	const processCoords = (coords: google.maps.LatLngLiteral[]) => {
		for (const coord of coords) {
			bounds.extend(coord);
		}
	};

	if (geometry.type !== "MultiPolygon") {
		console.warn(
			"Unsupported geometry type for bounds calculation:",
			geometry.type,
		);
		return bounds;
	}

	for (const coords of geometry.coordinates) {
		console.log("Processing coordinates:", coords);
		processCoords(
			coords[0].map((c) => ({
				lat: c[1],
				lng: c[0],
			})),
		);
	}

	return bounds;
};

export default function ZonePolygon(props: {
	geojson: GeoJSON.Geometry | null;
	color: string;
	setSelectedZone: () => void;
}) {
	const map = useMap();
	const isMobile = useMediaQuery(`(max-width: 480px)`);
	const id = uuidv4();

	// ใช้ useEffect เพื่อจัดการ Add/Remove ตาม Lifecycle ป้องกันการซ้อนทับ
	useEffect(() => {
		if (!map || !props.geojson) return;

		// 1. สร้าง Feature Object
		// เราไม่จำเป็นต้องใส่ Style ใน properties ตรงนี้ เพราะจะไป override ทีหลัง
		const featureData = {
			type: "Feature",
			geometry: props.geojson,
			properties: {
				// เก็บค่าสีไว้ใน properties เพื่อใช้อ้างอิง (เผื่อไว้)
				id: id,
			},
		};

		// 2. Add Feature เข้า Map Data Layer
		// addGeoJson คืนค่ากลับมาเป็น Array ของ Features ที่ถูกเพิ่ม
		const features = map.data.addGeoJson(featureData);

		// 3. จัดการ Style (แก้ปัญหาเรื่องสี)
		// ใช้ overrideStyle เพื่อบังคับ Style เฉพาะ Feature นี้ตาม Props

		features.forEach((feature) => {
			console.log("Styling feature:", feature);
			if (feature.getProperty("id") !== id) return;
			map.data.overrideStyle(feature, {
				fillColor: props.color,
				fillOpacity: 0.5,
				strokeColor: props.color,
				strokeWeight: 2,
				strokeOpacity: 1,
				clickable: true, // ทำให้กดได้
			});

			// 4. จัดการ Click Event (แก้ปัญหาเรื่อง Fit Bounds)
			// Google Maps Data Layer ใช้ addListener แยกต่างหาก
			map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
				// เช็คว่า event เกิดขึ้นบน feature นี้หรือไม่
				if (event.feature === feature) {
					props.setSelectedZone();

					// คำนวณ Bounds และ Zoom
					const bounds = getBoundsFromGeoJson(props.geojson!);
					// เช็คว่า bounds ไม่ว่างเปล่า
					if (!bounds.isEmpty()) {
						// padding เล็กน้อย
						map.fitBounds(bounds, isMobile ? 50 : 100);
					}
				}
			});
		});

		// 5. Cleanup Function (แก้ปัญหา map re-render แล้วซ้อนกัน)
		// เมื่อ props เปลี่ยน หรือ component หายไป ให้ลบ feature ออก
		return () => {
			features.forEach((feature) => {
				map.data.remove(feature); // ลบออกจากแมพ
			});
		};
	}, [map, props, isMobile, id]); // Re-run ถ้า map, geojson หรือสีเปลี่ยน

	return null;
}
