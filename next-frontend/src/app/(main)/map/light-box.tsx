"use client";
import { useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
	images: string[];
	isOpen: boolean;
	initialIndex: number;
	onClose: () => void;
	setIndex: (index: number) => void; // ฟังก์ชันเปลี่ยนรูป
}

export default function Lightbox({
	images,
	isOpen,
	initialIndex,
	onClose,
	setIndex,
}: LightboxProps) {
	// 1. Handle Keyboard (กด Esc เพื่อปิด, กดลูกศรเพื่อเลื่อน)
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return;
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") setIndex((initialIndex + 1) % images.length); // วนลูปกลับไปรูปแรก
			if (e.key === "ArrowLeft")
				setIndex((initialIndex - 1 + images.length) % images.length); // วนกลับไปรูปสุดท้าย
		},
		[isOpen, onClose, initialIndex, images.length, setIndex]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		// ป้องกันการ Scroll หน้าหลังบ้านตอนเปิดรูป
		if (isOpen) document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "auto";
		};
	}, [handleKeyDown, isOpen]);

	if (!isOpen) return null;

	return (
		// Backdrop สีดำ (ใช้ z-50 เพื่อให้ลอยเหนือทุกอย่าง)
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300 w-full">
			{/* ปุ่ม Close (X) มุมขวาบน */}
			<button
				onClick={onClose}
				className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
			>
				<X className="w-8 h-8" />
			</button>

			{/* ปุ่ม Prev (<) */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIndex((initialIndex - 1 + images.length) % images.length);
				}}
				className="absolute left-4 text-white hover:scale-110 transition-transform p-2 bg-black/50 rounded-full z-10"
			>
				<ChevronLeft className="w-8 h-8" />
			</button>

			{/* Main Image Container */}
			<div className="relative w-full h-full max-w-5xl max-h-[90vh] p-4 flex items-center justify-center">
				<Image
					src={images[initialIndex]}
					alt="Full view"
					fill
					className="object-contain" // สำคัญ! ทำให้รูปไม่เบี้ยว แต่ขยายเต็มพื้นที่ที่มี
					priority
				/>
			</div>

			{/* ปุ่ม Next (>) */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIndex((initialIndex + 1) % images.length);
				}}
				className="absolute right-4 text-white hover:scale-110 transition-transform p-2 bg-black/50 rounded-full z-10"
			>
				<ChevronRight className="w-8 h-8" />
			</button>

			{/* Counter (1/5) */}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
				{initialIndex + 1} / {images.length}
			</div>
		</div>
	);
}
