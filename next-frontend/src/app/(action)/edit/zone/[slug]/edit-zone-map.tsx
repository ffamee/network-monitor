"use client";

import { DrawingManager } from "@/components/gl-map/drawing/terra-draw-map";
import GoogleMap from "@/components/gl-map/google-map";
import React, { useEffect } from "react";
import ColorPickerAdvanced from "./color-selector";
import { RefreshCw } from "lucide-react";

interface EditZoneMapProps {
	color: string;
	slug: string;
}

export default function EditZoneMap({ color, slug }: EditZoneMapProps) {
	// const drawingManager = useDrawingManager();
	const [syncData, setSyncData] = React.useState<boolean>(false);
	const [polygonColor, setPolygonColor] = React.useState<string>(color);
	const [paths, setPaths] = React.useState<string | null>(null);

	useEffect(() => {
		const updateMapPolygon = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/mapping/${slug}`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ paths, color: polygonColor }),
						credentials: "include",
					}
				);

				if (res.ok) {
					const data = await res.json();
					console.log(data);
				} else {
					throw new Error("Failed to fetch zone mapping data");
				}
			} catch (error) {
				console.error("Error fetching zone mapping data:", error);
			} finally {
				setSyncData(false);
			}
		};
		setSyncData(true);
		updateMapPolygon();
		// setSyncData(false);
	}, [paths, slug, polygonColor]);

	const handleSetPolygonColor = (newColor: string) => {
		const debounce = setTimeout(() => {
			setPolygonColor(newColor);
		}, 200);
		return () => clearTimeout(debounce);
	};

	return (
		<div className="w-full h-full relative">
			<GoogleMap>
				<DrawingManager
					initialPaths={paths}
					onPathChange={setPaths}
					color={polygonColor}
				/>
			</GoogleMap>
			<div
				data-loading={syncData ? "true" : "false"}
				className="absolute top-4 right-4 text-primary z-10 text-sm
									data-[loading=false]:hidden flex gap-4 p-2 rounded-xl bg-card items-center justify-center"
			>
				<RefreshCw className="animate-spin" size={16} />
				Syncing ...
			</div>
			<div className="absolute bottom-4 right-4 z-10">
				<ColorPickerAdvanced
					color={polygonColor}
					onChange={handleSetPolygonColor} // ส่ง setPolygonColor เข้าไปตรงๆ ได้เลย
				/>
			</div>
		</div>
	);
}
