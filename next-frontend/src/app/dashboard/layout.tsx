import DashboardTopNavBar from "@/components/navbar/dashboard-top-nav";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			<DashboardTopNavBar />
			{children}
		</section>
	);
}
