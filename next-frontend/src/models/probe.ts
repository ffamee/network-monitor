import { ImageInfo } from "./image";

type Probe = {
	id: number;
	name: string;
	floor?: number;
	description?: string;
	address?: string;
	googlePlaceId?: string;
	serialNumber: string;
	lat: number;
	lng: number;
	slug: string;
	images: ImageInfo[];
};

type ProbeDetail = Probe & {
	// model: string;
	// status: string;
	ipAddress?: string;
	macAddress?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type { Probe, ProbeDetail };
