import { ImageInfo } from "./image";

type Zone = {
	id: number;
	name: string;
	description?: string;
	color: string;
	geojson: GeoJSON.Geometry | null;
	slug: string;
	images: ImageInfo[];
};

export type { Zone };
