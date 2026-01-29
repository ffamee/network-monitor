export default function EditLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="container mx-auto min-h-full h-dvh overflow-y-auto overscroll-none no-scrollbar">
			{children}
		</section>
	);
}
