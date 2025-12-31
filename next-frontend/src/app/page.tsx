// import { ComponentExample } from "@/components/component-example";
// import { GoogleMap } from "@/components/gl-map/google-map";
import { ModeToggle } from "@/components/togglemode";
import Link from "next/link";

export default function Page() {
	return (
		<div className="size-96">
			<ModeToggle />
			<Link href="/about" className="text-blue-500 hover:underline">
				Go to About Page
			</Link>
			{/* <ComponentExample /> */}
			{/* <GoogleMap /> */}
		</div>
	);
}
