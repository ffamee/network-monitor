"use client";

import MapPlace, { PlaceHandler } from "@/components/gl-map/map-place";
import { LocationInfo } from "@/app/(action)/add/building/[slug]/page";
import GoogleMap from "@/components/gl-map/google-map";
import { forwardRef } from "react";

interface EditProbeMapProps {
	onLocationSelect: (data: LocationInfo) => void;
}

const EditProbeMap = forwardRef<PlaceHandler, EditProbeMapProps>(
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
EditProbeMap.displayName = "EditProbeMap";
export default EditProbeMap;

// export default function EditBuildingMap({
// 	onLocationSelect,
// }: EditBuildingMapProps) {
// 	return <div className="w-full h-full">Copy from add building map</div>;

// return (
// 	<div className="w-full h-full">
// 		<GoogleMap props={{ className: "min-h-[50dvh]", clickableIcons: true }}>
// 			{/** advance marker from location */}
// 		</GoogleMap>
// 		<div
// 			data-loading={syncData ? "true" : "false"}
// 			className="absolute top-4 right-4 text-primary z-10 text-sm
// 								data-[loading=false]:hidden flex gap-4 p-2 rounded-xl bg-card items-center justify-center"
// 		>
// 			<RefreshCw className="animate-spin" size={16} />
// 			Syncing ...
// 		</div>
// 	</div>
// );
// }
