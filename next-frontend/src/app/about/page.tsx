import Link from "next/link";

export default function AboutPage() {
	return (
		<div>
			<h1>About Us</h1>
			<p>
				Welcome to the About Us page. Here you can learn more about our mission
				and values.
			</p>
			<Link href="/" className="text-blue-500 hover:underline">
				Go back to Home
			</Link>
			<button disabled>Disabled Button</button>
		</div>
	);
}
