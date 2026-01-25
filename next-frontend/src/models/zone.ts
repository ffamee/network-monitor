import { ImageInfo } from "./image";

type Zone = {
	id: number;
	name: string;
	description?: string;
	color: string;
	geojson?: string;
	images: ImageInfo[];
	// buildings: Building[];
};

export type { Zone };
