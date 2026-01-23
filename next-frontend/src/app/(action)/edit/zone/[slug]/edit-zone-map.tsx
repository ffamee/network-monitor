"use client";

import { DrawingManager } from "@/components/gl-map/drawing/terra-draw-map";
import GoogleMap from "@/components/gl-map/google-map";
import React from "react";
import ColorPickerAdvanced from "@/components/gl-map/color-selector";

interface EditZoneMapProps {
	color: string;
	geojson: string | null;
	onPathsChange: (paths: string | null) => void;
	onColorChange: (color: string) => void;
}

export default function EditZoneMap({
	color,
	geojson,
	onPathsChange,
	onColorChange,
}: EditZoneMapProps) {
	// const drawingManager = useDrawingManager();
	// const [syncData, setSyncData] = React.useState<boolean>(false);
	// const [polygonColor, setPolygonColor] = React.useState<string>(color);
	// const [paths, setPaths] = React.useState<string | null>(geojson || null);

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

	const handleSetPolygonColor = (newColor: string) => {
		const debounce = setTimeout(() => {
			onColorChange(newColor);
		}, 200);
		return () => clearTimeout(debounce);
	};

	return (
		<div className="w-full h-full relative">
			<GoogleMap props={{ className: "min-h-[50dvh]" }}>
				<DrawingManager
					initialPaths={geojson}
					onPathsChange={onPathsChange}
					color={color}
				/>
			</GoogleMap>
			{/* <div
				data-loading={syncData ? "true" : "false"}
				className="absolute top-4 right-4 text-primary z-10 text-sm
									data-[loading=false]:hidden flex gap-4 p-2 rounded-xl bg-card items-center justify-center"
			>
				<RefreshCw className="animate-spin" size={16} />
				Syncing ...
			</div> */}
			<div className="absolute bottom-4 right-4 z-10">
				<ColorPickerAdvanced
					color={color}
					onChange={handleSetPolygonColor} // ส่ง setPolygonColor เข้าไปตรงๆ ได้เลย
				/>
			</div>
		</div>
	);
}
