import GoogleMap from "@/components/gl-map/google-map";
import MapPlace, {
	PlaceHandler,
} from "../../../../../components/gl-map/map-place";
import { LocationInfo } from "../../building/[slug]/page";
import { forwardRef } from "react";

interface AddProbeMapProps {
	onLocationSelect: (data: LocationInfo) => void;
}

const AddProbeMap = forwardRef<PlaceHandler, AddProbeMapProps>((props, ref) => {
	return (
		<div className="w-full h-full">
			<GoogleMap props={{ className: "min-h-[50dvh]", clickableIcons: true }}>
				<MapPlace onLocationSelect={props.onLocationSelect} ref={ref} />
			</GoogleMap>
		</div>
	);
});
AddProbeMap.displayName = "AddProbeMap";
export default AddProbeMap;
