"use client";

import { DrawingManager } from "@/components/gl-map/drawing/terra-draw-map";
import GoogleMap from "@/components/gl-map/google-map";
import ColorPickerAdvanced from "@/components/gl-map/color-selector";

interface AddZoneMapProps {
	color: string;
	setColor: (color: string) => void;
	geojson: string | null;
	setGeojson: (geojson: string | null) => void;
}

export default function AddZoneMap({
	color,
	setColor,
	geojson,
	setGeojson,
}: AddZoneMapProps) {
	// const drawingManager = useDrawingManager();
	// const [syncData, setSyncData] = React.useState<boolean>(false);
	// const [polygonColor, setPolygonColor] = React.useState<string>(color);
	// const [paths, setPaths] = React.useState<string | null>(null);

	// useEffect(() => {
	// 	const updateMapPolygon = async () => {
	// 		try {
	// 			const res = await fetch(
	// 				`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/mapping/${slug}`,
	// 				{
	// 					method: "PATCH",
	// 					headers: {
	// 						"Content-Type": "application/json",
	// 					},
	// 					body: JSON.stringify({ paths, color: polygonColor }),
	// 					credentials: "include",
	// 				},
	// 			);

	// 			if (res.ok) {
	// 				const data = await res.json();
	// 				console.log(data);
	// 			} else {
	// 				throw new Error("Failed to update zone mapping data");
	// 			}
	// 		} catch (error) {
	// 			console.error("Error updating zone mapping data:", error);
	// 		} finally {
	// 			setSyncData(false);
	// 		}
	// 	};
	// 	setSyncData(true);
	// 	updateMapPolygon();
	// 	// setSyncData(false);
	// }, [paths, slug, polygonColor]);

	const handleSetColor = (newColor: string) => {
		const debounce = setTimeout(() => {
			setColor(newColor);
		}, 200);
		return () => clearTimeout(debounce);
	};

	return (
		<div className="w-full h-full relative">
			<GoogleMap props={{ className: "min-h-[50dvh]" }}>
				<DrawingManager
					color={color}
					initialPaths={geojson}
					onPathChange={setGeojson}
				/>
			</GoogleMap>
			<div className="absolute bottom-4 right-4 z-10">
				<ColorPickerAdvanced
					color={color}
					onChange={handleSetColor} // ส่ง setPolygonColor เข้าไปตรงๆ ได้เลย
				/>
			</div>
		</div>
	);
}
