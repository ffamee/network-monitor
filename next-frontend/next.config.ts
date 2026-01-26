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
			{
				protocol: "http",
				hostname: "localhost",
				port: "9000",
				pathname: "/app-storage/**",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "9000",
				pathname: "/app-storage/**",
			},
		],
	},
};

export default nextConfig;
