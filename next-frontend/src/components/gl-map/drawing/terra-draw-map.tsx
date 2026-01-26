"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import {
	TerraDraw,
	TerraDrawSelectMode,
	TerraDrawPolygonMode,
	HexColor,
} from "terra-draw";
import { TerraDrawGoogleMapsAdapter } from "terra-draw-google-maps-adapter";
import { Eraser, PenLine, PenTool, Trash2 } from "lucide-react";

// --- Functions ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processSnapshotForUndo(snapshot: any[]): any[] {
	// console.log("Processing snapshot for undo:", snapshot);
	return snapshot.map((feature) => {
		const newFeature = JSON.parse(JSON.stringify(feature));

		if (newFeature.properties.mode === "rectangle") {
			// console.log("Processing rectangle for undo:", newFeature);
			newFeature.geometry.type = "Polygon";
			newFeature.properties.mode = "polygon";
		} else if (newFeature.properties.mode === "circle") {
			// console.log("Processing circle for undo:", newFeature);
			newFeature.geometry.type = "Polygon";
			// The radius is already in properties, so we just need to ensure the mode is correct for re-creation
			newFeature.properties.mode = "circle";
		}
		return newFeature;
	});
}

interface PolygonEditorProps {
	color: string;
	initialPaths: string | null;
	onPathsChange: (paths: string | null) => void;
}

export const DrawingManager = ({
	color,
	initialPaths,
	onPathsChange,
}: PolygonEditorProps) => {
	const map = useMap();
	const drawRef = useRef<TerraDraw | null>(null);
	const debounceTime = useRef<NodeJS.Timeout | null>(null);
	// State
	const [currentMode, setCurrentMode] = useState<
		"static" | "polygon" | "select"
	>("static");
	const [selectedId, setSelectedId] = useState<string | null>(null); // เก็บ ID ของสิ่งที่ถูกเลือก

	// History
	// const history = useRef<any[]>([]);
	// const redoHistory = useRef<any[]>([]);
	const isRestoring = useRef(false);

	// Ref
	// const onPathChangeRef = onPathChange);
	const hasInitialPaths = useRef<boolean>(true);
	const initialPathsRef = useRef<string | null>(initialPaths);
	const colorRef = useRef<string>(color);

	useEffect(() => {
		// 1. เช็คความพร้อมของ Map และ Div (แก้ Error addEventListener null)
		// if (!map || !window.google || !map.getDiv()) return;
		if (!map || !window.google) return;

		console.log("Initializing Terra Draw...");

		const listener = map.addListener("projection_changed", () => {
			const adapter = new TerraDrawGoogleMapsAdapter({
				map,
				lib: window.google.maps,
				coordinatePrecision: 9,
			});

			const draw = new TerraDraw({
				adapter,
				modes: [
					new TerraDrawSelectMode({
						flags: {
							polygon: {
								feature: {
									draggable: true, // <--- สำคัญ: ลากย้ายทั้งก้อนได้ (คลิกที่สี)
									rotateable: true,
									coordinates: {
										midpoints: true, // มีจุดกลางให้ดึงเพิ่ม
										draggable: true, // ลากย้ายจุดได้
										deletable: true, // ลบจุดได้ (เลือกจุดแล้วกด Delete ที่คีย์บอร์ด)
									},
								},
							},
						},
					}),
					new TerraDrawPolygonMode({
						editable: true,
						styles: {
							fillColor: (colorRef.current as HexColor) ?? "#3b82f6",
							fillOpacity: 0.4,
							outlineColor: (colorRef.current as HexColor) ?? "#2563eb",
							outlineWidth: 2,
						},
					}),
				],
			});

			draw.start();
			drawRef.current = draw;

			// 2. รอให้ Ready ก่อนค่อยเริ่มทำงาน
			draw.on("ready", () => {
				console.log("Terra Draw Ready");
				// โหลด Initial Paths ถ้ามี
				if (
					hasInitialPaths.current &&
					initialPathsRef.current &&
					initialPathsRef.current.length > 0
				) {
					// hasInitialPaths.current = false;
					// remove previous features
					console.log("trying to load initial paths...");
					try {
						draw.clear();
						const geojson = JSON.parse(initialPathsRef.current);
						if (geojson.type === "FeatureCollection") {
							console.log(
								"Adding FeatureCollection features:",
								geojson.features,
							);
							draw.addFeatures(geojson.features);
							// Init History
							// history.current.push(draw.getSnapshot());
						} else if (geojson.type === "MultiPolygon") {
							// แปลง MultiPolygon เป็น FeatureCollection
							const features = geojson.coordinates.map(
								(coordinates: unknown) => ({
									id: self.crypto.randomUUID(),
									type: "Feature",
									properties: { mode: "polygon", selected: false },
									geometry: {
										type: "Polygon",
										coordinates,
									},
								}),
							);
							console.log(
								"Adding MultiPolygon features:",
								features,
								JSON.stringify(features),
							);
							draw.addFeatures(features);
							const check = draw.getSnapshot();
							console.log("Check added features:", check);
						} else {
							throw new Error(
								"Invalid GeoJSON file: must be a FeatureCollection.",
							);
						}
					} catch (error) {
						console.error("Error parsing GeoJSON file.", error);
					}
				}
				console.log(
					"Initial Paths loaded.",
					initialPathsRef.current,
					hasInitialPaths.current,
				);
				hasInitialPaths.current = false;
				// Init History
				// history.current.push(draw.getSnapshot());
			});

			// 3. จัดการ Event Select / Deselect
			draw.on("select", (id) => {
				// id จะส่งมาเป็น string ถ้าเลือก Feature
				// แต่อาจจะเป็น object ถ้าเลือก vertex (เราสนใจแค่ Feature ID เพื่อลบทั้งก้อน)
				if (typeof id === "string") {
					setSelectedId(id);
					console.log("Selected:", id);
				}
			});

			draw.on("deselect", () => {
				setSelectedId(null);
				console.log("Deselected");
			});

			// 4. จัดการ Change (Undo/Redo + Extract)
			draw.on("change", () => {
				if (isRestoring.current) return;

				if (debounceTime.current) {
					clearTimeout(debounceTime.current);
				}

				debounceTime.current = setTimeout(() => {
					const snapshot = draw.getSnapshot();
					const processedSnapshot = processSnapshotForUndo(snapshot);
					// history.current.push(processedSnapshot);
					// redoHistory.current = [];

					const isFinished = processedSnapshot.some(
						(f) =>
							f.properties.mode === "select" || f.properties.currentlyDrawing,
					);

					if (isFinished) return; // ยังวาดไม่เสร็จ ไม่ต้องอัพเดท

					// แปลงเป็น GeoJSON แล้วส่งกลับ
					const geojson = {
						type: "FeatureCollection",
						features: processedSnapshot,
					};
					const data = JSON.stringify(geojson);
					initialPathsRef.current = data;
					onPathsChange(data);
				}, 300);
				// Extract Path Logic
				// const polygonFeature = snapshot.find(
				// 	(f) => f.geometry.type === "Polygon"
				// );
				// if (polygonFeature) {
				// 	const coordinates = polygonFeature.geometry.coordinates[0].map(
				// 		(coord: any) => ({
				// 			lat: coord[1],
				// 			lng: coord[0],
				// 		})
				// 	);
				// 	onPathChange(coordinates);
				// } else {
				// 	onPathChange([]);
				// }
			});
		});

		// console.log("unmounting Terra Draw...");

		return () => {
			// Cleanup เช็คก่อน stop
			console.log("Cleaning up Terra Draw...");
			google.maps.event.removeListener(listener);
			hasInitialPaths.current = true;
			if (drawRef.current) {
				console.log("Stopping Terra Draw...");
				drawRef.current.stop();
				drawRef.current = null;
			}
		};
	}, [map, onPathsChange]);

	useEffect(() => {
		if (!drawRef.current) return;
		console.log("Updating polygon color to:", color);
		colorRef.current = color;
		drawRef.current.updateModeOptions("polygon", {
			// editable: true,
			styles: {
				fillColor: (colorRef.current as HexColor) ?? "#3b82f6",
				// fillOpacity: 0.4,
				outlineColor: (colorRef.current as HexColor) ?? "#2563eb",
				// outlineWidth: 2,
			},
		});
		const snapShot = drawRef.current.getSnapshot();
		if (snapShot && snapShot.length > 0) {
			// ปักธงว่า "กำลังรีเฟรชสีนะ" ห้ามบันทึก History
			isRestoring.current = true;

			drawRef.current.clear(); // ลบของเก่า (ที่เป็นสีเดิม)
			drawRef.current.addFeatures(snapShot); // ใส่กลับเข้าไป (TerraDraw จะวาดใหม่ด้วยสีใหม่)

			// ปลดล็อค History (ใช้ setTimeout เพื่อรอให้ Event จบก่อน)
			setTimeout(() => {
				isRestoring.current = false;
			}, 0);
		}
	}, [color]);

	// --- Actions ---

	const setMode = (mode: "polygon" | "select") => {
		console.log("Setting mode to:", mode, drawRef.current);
		if (!drawRef.current) return;
		if (mode === currentMode) {
			drawRef.current.setMode("static");
			setCurrentMode("static");
			setSelectedId(null);
			return;
		}
		drawRef.current.setMode(mode);
		setCurrentMode(mode);
	};

	// const handleUndo = () => {
	// 	if (!drawRef.current || history.current.length <= 1) return;
	// 	const current = history.current.pop();
	// 	redoHistory.current.push(current);
	// 	const prev = history.current[history.current.length - 1];
	// 	restoreSnapshot(prev);
	// };

	// const handleRedo = () => {
	// 	if (!drawRef.current || redoHistory.current.length === 0) return;
	// 	const next = redoHistory.current.pop();
	// 	history.current.push(next);
	// 	restoreSnapshot(next);
	// };

	const handleClear = () => {
		if (!drawRef.current) return;
		drawRef.current.clear();
		onPathsChange(null); // เคลียร์ค่าออก
	};

	// ฟังก์ชันลบสิ่งทีเลือกอยู่ (Delete Whole Feature)
	const handleDeleteSelected = () => {
		if (!drawRef.current || !selectedId) return;
		drawRef.current.removeFeatures([selectedId]);
		setSelectedId(null); // เคลียร์ state
	};

	// const restoreSnapshot = (snapshot: any) => {
	// 	isRestoring.current = true;
	// 	drawRef.current?.clear();
	// 	drawRef.current?.addFeatures(snapshot);
	// 	// ต้องเซ็ต timeout เพื่อให้ event loop รอบถัดไปค่อยปลด lock
	// 	setTimeout(() => {
	// 		isRestoring.current = false;
	// 	}, 0);
	// };

	// Styles
	const btnClass = (isActive: boolean, isDelete: boolean = false) => `
    px-3 py-1.5 text-sm font-medium rounded-md transition-colors border h-full
    ${
			isDelete
				? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
				: isActive
					? "bg-primary border-primary text-primary-foreground"
					: "bg-accent text-accent-foreground border-ring hover:bg-accent-foreground hover:text-accent"
		}
    ${!isActive && !isDelete ? "hover:bg-gray-50" : ""}
  `;

	return (
		<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card p-2 rounded-lg shadow-lg flex gap-2 z-10 items-center">
			{/* Draw / Edit */}
			<button
				onClick={() => setMode("polygon")}
				className={btnClass(currentMode === "polygon")}
				title="Draw Polygon"
			>
				{/* ✏️ Draw */}
				<PenLine size={16} />
			</button>
			<button
				onClick={() => setMode("select")}
				className={btnClass(currentMode === "select")}
				title="Edit Polygon"
			>
				{/* ✋ Edit */}
				<PenTool size={16} />
			</button>

			{/* Utilities */}
			{/* <div className="flex gap-1 border-r border-gray-200 pr-2">
				<button onClick={handleUndo} className={btnClass(false)}>
					↩️
				</button>
				<button onClick={handleRedo} className={btnClass(false)}>
					↪️
				</button>
			</div> */}

			<button
				disabled={!selectedId}
				onClick={handleDeleteSelected}
				className={btnClass(false, true)}
				title="Delete Selected"
			>
				<Eraser size={16} />
			</button>
			{/* Delete / Clear */}
			<button
				onClick={handleClear}
				className={btnClass(false, true)}
				title="Clear All"
			>
				<Trash2 size={16} />
			</button>
		</div>
	);
};
