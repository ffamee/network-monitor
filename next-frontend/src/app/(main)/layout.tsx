import MainTopNavBar from "@/components/navbar/main-top-nav";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="min-h-full h-dvh overflow-y-auto overscroll-none no-scrollbar">
			<MainTopNavBar />
			{children}
		</section>
	);
}
