import GoogleMap from "@/components/gl-map/google-map";
import MapPlace, { PlaceHandler } from "./map-place";
import { LocationInfo } from "./page";
import { forwardRef } from "react";

interface AddBuildingMapProps {
	onLocationSelect: (data: LocationInfo) => void;
}

const AddBuildingMap = forwardRef<PlaceHandler, AddBuildingMapProps>(
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
