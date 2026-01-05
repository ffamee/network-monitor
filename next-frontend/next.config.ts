import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	// Image hosts
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
};

export default nextConfig;
