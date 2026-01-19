"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { LocationInfo } from "./page";

export interface MapHandler {
	getPlaceDetails: (placeId: string) => Promise<{
		lat: number;
		lng: number;
		placeId?: string;
		name?: string;
		address?: string;
	} | null>;
}

interface AddBuildingMapProps {
	// location: LocationInfo | null;
	onLocationSelect: (data: LocationInfo) => void;
}

const MapPlace = forwardRef<MapHandler, AddBuildingMapProps>(
	({ onLocationSelect }, ref) => {
		const map = useMap();
		const placesLib = useMapsLibrary("places"); // เรียกใช้ Library Places

		useImperativeHandle(ref, () => ({
			getPlaceDetails: async (placeId: string) => {
				if (!placesLib) {
					console.error("Places library not loaded yet");
					return null;
				}

				// B. สั่ง fetchFields (แทน getDetails)
				// ข้อดี: เลือก field ได้ละเอียดมาก และคิดเงินตาม field ที่เลือก
				try {
					const place = new placesLib.Place({
						id: placeId,
					});
					await place.fetchFields({
						fields: ["displayName", "formattedAddress", "location", "id"],
					});

					// C. ดึงข้อมูลออกมา (สังเกตชื่อ field จะเปลี่ยนไปนิดหน่อย)
					return {
						lat: place.location!.lat(),
						lng: place.location!.lng(),
						placeId: place.id,
						name: place.displayName ?? undefined, // API เก่าคือ .name
						address: place.formattedAddress ?? undefined, // API เก่าคือ .formatted_address
					};
				} catch (error) {
					console.error("Error fetching place details:", error);
					return null;
				}
			},
		}));

		useEffect(() => {
			if (!map || !placesLib) return;

			// สร้าง Service สำหรับดึงรายละเอียดสถานที่
			// const placesService = new placesLib.PlacesService(map);

			const clickListener = map.addListener(
				"click",
				async (e: google.maps.MapMouseEvent) => {
					// หยุด Default UI ของ Google (ที่มันจะเด้ง InfoWindow ขึ้นมาเองเวลาคลิก POI)
					// e.stop();

					const clickedLat = e.latLng?.lat();
					const clickedLng = e.latLng?.lng();

					if (!clickedLat || !clickedLng) return;

					// --- กรณีที่ 1: คลิกโดน POI (สถานที่) ---
					// Google Maps event จะมี field 'placeId' ติดมาถ้าคลิกโดนไอคอนสถานที่
					if ("placeId" in e && e.placeId) {
						onLocationSelect({
							lat: clickedLat,
							lng: clickedLng,
							placeId: e.placeId as string,
							// ชื่อกับที่อยู่ยังไม่ได้ดึงมา
							name: undefined,
							address: undefined,
						});
						// const place = new placesLib.Place({
						// 	id: e.placeId as string,
						// });

						// // B. สั่ง fetchFields (แทน getDetails)
						// // ข้อดี: เลือก field ได้ละเอียดมาก และคิดเงินตาม field ที่เลือก
						// try {
						// 	await place.fetchFields({
						// 		fields: ["displayName", "formattedAddress", "location", "id"],
						// 	});

						// 	// C. ดึงข้อมูลออกมา (สังเกตชื่อ field จะเปลี่ยนไปนิดหน่อย)
						// 	onLocationSelect({
						// 		lat: place.location!.lat(),
						// 		lng: place.location!.lng(),
						// 		placeId: place.id,
						// 		name: place.displayName ?? undefined, // API เก่าคือ .name
						// 		address: place.formattedAddress ?? undefined, // API เก่าคือ .formatted_address
						// 	});
						// } catch (error) {
						// 	console.error("Error fetching place details:", error);
						// }
					} else {
						e.stop(); // หยุด Default UI
						// --- กรณีที่ 2: คลิกพื้นที่ว่างๆ ---
						onLocationSelect({
							lat: clickedLat,
							lng: clickedLng,
							// เคลียร์ค่า POI ออก
							placeId: undefined,
							name: undefined,
							address: undefined,
						});
					}
				},
			);

			return () => {
				google.maps.event.removeListener(clickListener);
			};
		}, [map, placesLib, onLocationSelect]);

		return (
			// <div className="absolute inset-0 w-full h-32 bg-amber-400">
			// 	{/* ตัวนี้เป็นแค่ Marker แสดงตำแหน่งที่เลือก */}
			// </div>
			null
		);
	},
);

MapPlace.displayName = "MapPlace"; // ต้องใส่ชื่อเวลาใช้ forwardRef
export default MapPlace;
