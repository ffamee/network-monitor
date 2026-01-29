"use client";

import { Cluster } from "@/components/gl-map/cluster/cluster";
import { Probe } from "@/models/probe";
import { useEffect, useState } from "react";

export default function UserMap() {
	const [probes, setProbes] = useState<Probe[]>([]);

	useEffect(() => {
		const fetchProbes = async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe`,
				{
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				},
			);
			const data = await response.json();
			// receive data from backend as Object
			setProbes(data);
		};
		fetchProbes();
	}, []);

	return (
		<Cluster
			locations={probes.map((probe) => ({
				key: probe.id.toString(),
				location: { lat: probe.lat, lng: probe.lng },
			}))}
		/>
	);
}
