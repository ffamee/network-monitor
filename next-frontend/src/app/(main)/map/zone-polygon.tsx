import { Polygon } from "@/components/gl-map/geometry/polygon";
import { useMap } from "@vis.gl/react-google-maps";
import { useMediaQuery } from "usehooks-ts";

export default function ZonePolygon(props: {
	paths: google.maps.LatLngLiteral[];
	color: string;
	setSelectedZone: () => void;
}) {
	const map = useMap();
	const isMobile = useMediaQuery(`(max-width: 480px)`);
	const handleClick = () => {
		const bounds = new google.maps.LatLngBounds();
		props.paths.forEach((path) => bounds.extend(path));
		map?.fitBounds(bounds, isMobile ? 50 : 100);

		props.setSelectedZone();
	};

	return (
		<Polygon
			paths={props.paths}
			strokeColor={props.color}
			fillColor={props.color}
			onClick={handleClick}
		/>
	);
}
