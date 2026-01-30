import { ImageInfo } from "./image";
import { Probe } from "./probe";

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

type BuildingWithProbe = Building & {
	probes: Probe[];
};

export type { Building, BuildingWithProbesCount, BuildingWithProbe };
