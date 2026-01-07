export default function EditLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="min-h-full h-dvh w-full overflow-y-auto overscroll-none no-scrollbar bg-background">
			{children}
		</section>
	);
}
