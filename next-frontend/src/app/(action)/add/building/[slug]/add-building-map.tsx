import GoogleMap from "@/components/gl-map/google-map";
import MapPlace, { MapHandler } from "./map-place";
import { LocationInfo } from "./page";
import { forwardRef } from "react";

// export default function AddBuildingMap({
// 	onLocationSelect,
// }: {
// 	slug: string;
// 	onLocationSelect: (data: LocationInfo) => void;
// }) {
// 	return (
// 		<div className="w-full h-full">
// 			<GoogleMap props={{ className: "min-h-[50dvh]", clickableIcons: true }}>
// 				<MapPlace onLocationSelect={onLocationSelect} />
// 			</GoogleMap>
// 		</div>
// 	);
// }

interface AddBuildingMapProps {
	slug: string;
	onLocationSelect: (data: LocationInfo) => void;
}

const AddBuildingMap = forwardRef<MapHandler, AddBuildingMapProps>(
	(props, ref) => {
		return (
			<div className="w-full h-full">
				<GoogleMap props={{ className: "min-h-[50dvh]", clickableIcons: true }}>
					<MapPlace onLocationSelect={props.onLocationSelect} ref={ref} />
				</GoogleMap>
			</div>
		);
	},
);
AddBuildingMap.displayName = "AddBuildingMap";
export default AddBuildingMap;
