import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

export default function LogPagination({
	count,
	page,
	date,
}: {
	count: number;
	page?: string;
	date?: string;
}) {
	const totalPages = Math.max(1, count || 1);
	const currentPage = Math.min(
		totalPages,
		Math.max(1, Number.isNaN(Number(page)) ? 1 : Number(page))
	);

	const prevDisabled = currentPage <= 1 || totalPages <= 1;
	const nextDisabled = currentPage >= totalPages || totalPages <= 1;

	const buildHref = (targetPage: number) => {
		const params = new URLSearchParams();
		params.set("page", targetPage.toString());
		if (date) params.set("date", date);
		return `?${params.toString()}`;
	};

	// Create a compact, responsive page list with ellipsis where needed
	const getPageItems = () => {
		// totalPages show is depending on screen size,
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const items: Array<number | "ellipsis"> = [1];
		const left = Math.max(2, currentPage - 1);
		const right = Math.min(totalPages - 1, currentPage + 1);

		if (left > 2) items.push("ellipsis");
		for (let i = left; i <= right; i++) items.push(i);
		if (right < totalPages - 1) items.push("ellipsis");
		items.push(totalPages);
		return items;
	};

	const pageItems = getPageItems();

	return (
		<Pagination className="mt-4 w-full">
			<PaginationContent className="justify-between gap-1 sm:justify-end-safe sm:gap-2 flex-wrap">
				<PaginationItem>
					<PaginationPrevious
						prefetch={false}
						href={prevDisabled ? "#" : buildHref(currentPage - 1)}
						aria-disabled={prevDisabled}
						tabIndex={prevDisabled ? -1 : 0}
						className={
							prevDisabled
								? "pointer-events-none opacity-40"
								: "hover:bg-accent"
						}
					/>
				</PaginationItem>

				{pageItems.map((item, idx) =>
					item === "ellipsis" ? (
						<PaginationItem key={`ellipsis-${idx}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationLink
								prefetch={false}
								href={buildHref(item)}
								isActive={item === currentPage}
								className="min-w-9 justify-center"
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					)
				)}

				<PaginationItem>
					<PaginationNext
						prefetch={false}
						href={nextDisabled ? "#" : buildHref(currentPage + 1)}
						aria-disabled={nextDisabled}
						tabIndex={nextDisabled ? -1 : 0}
						className={
							nextDisabled
								? "pointer-events-none opacity-40"
								: "hover:bg-accent"
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
