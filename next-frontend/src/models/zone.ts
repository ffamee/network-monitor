import { ImageInfo } from "./image";

type Zone = {
	id: number;
	name: string;
	description?: string;
	color: string;
	geojson: GeoJSON.Geometry | null;
	images: ImageInfo[];
	slug: string;
	// buildings: Building[];
};

export type { Zone };
