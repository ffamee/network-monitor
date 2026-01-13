"use client";

import { useRouter } from "next/navigation";

export const Modal = ({
	children,
}: // onClose
{
	children: React.ReactNode;
	// onClose: () => void;
}) => {
	// if (!isOpen) return null;
	const router = useRouter();
	const handleMouseDownOutside = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			router.back();
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			onMouseDown={handleMouseDownOutside}
		>
			<div className="relative bg-popover rounded-2xl p-6 w-[75vw] max-w-md shadow-xl text-popover-foreground overflow-auto">
				{/* Close button */}
				<button
					onClick={() => router.back()}
					className="absolute text-2xl top-2 right-4 text-gray-500 hover:text-gray-700"
				>
					×
				</button>
				{children}
			</div>
		</div>
	);
};
