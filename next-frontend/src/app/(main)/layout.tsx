import MainTopNavBar from "@/components/navbar/main-top-nav";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			<MainTopNavBar />
			{children}
		</section>
	);
}
