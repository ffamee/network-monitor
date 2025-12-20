// import { ComponentExample } from "@/components/component-example";
import { GoogleMap } from "@/components/gl-map/google-map";
import { ModeToggle } from "@/components/togglemode";

export default function Page() {
	return (
		<div className="size-96">
			<ModeToggle />
			<GoogleMap />
		</div>
	);
}
