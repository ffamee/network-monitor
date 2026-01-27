import { ImageInfo } from "./image";

type Zone = {
	id: number;
	name: string;
	description?: string;
	color: string;
	geojson: GeoJSON.Geometry | null;
	slug: string;
	images: ImageInfo[];
	// buildings: Building[];
};

export type { Zone };
