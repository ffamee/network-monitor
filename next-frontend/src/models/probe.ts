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

type ProbeWithStats = ProbeDetail & {
	status: string;
	latency: number;
	uptime: number;
	lastSeenAt: Date;
};

export type { Probe, ProbeDetail, ProbeWithStats };
