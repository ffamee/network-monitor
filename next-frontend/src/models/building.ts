import { ImageInfo } from "./image";

type Building = {
	id: number;
	name: string;
	floor?: number;
	admin?: string;
	tel?: string;
	address?: string;
	googlePlaceId?: string;
	lat: number;
	lng: number;
	slug: string;
	images: ImageInfo[];
};

type BuildingWithProbesCount = Building & {
	probeCount: number;
};

export type { Building, BuildingWithProbesCount };
