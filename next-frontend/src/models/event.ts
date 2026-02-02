type BaseEvent = {
	severity: "info" | "warning" | "critical";
	description: string | null;
	fingerprint: string;
	status: "firing" | "resolved";
	name: string;
};

type LogEvent = BaseEvent & {
	silence_url: string | null;
	startedAt: Date;
	resolvedAt: Date | null;
};

type RawEvent = BaseEvent & {
	silence_url: string | null;
	started_at: string;
	resolved_at: string | null;
};

export type { LogEvent, RawEvent };
