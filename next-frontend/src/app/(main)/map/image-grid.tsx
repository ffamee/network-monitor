import { ImageOff } from "lucide-react";
import Image from "next/image";

interface ImageGridProps {
	images: string[]; // รับ URL ของรูปภาพเข้ามา
	show: (images: string[], index: number) => void; // ฟังก์ชันเปิด Lightbox
}

export default function ImageGrid({ images, show }: ImageGridProps) {
	// 1. กำหนดว่าจะโชว์สูงสุดกี่รูป (ไม่รวม Overlay)
	const MAX_VISIBLE = 3;

	// 2. ตัด Array เอาเฉพาะตัวที่จะโชว์
	const visibleImages = images.slice(0, MAX_VISIBLE);

	// 3. คำนวณจำนวนที่เหลือ (เพื่อแสดง +X)
	const remaining = images.length - MAX_VISIBLE;

	if (images.length === 0) {
		return (
			<div className="flex flex-col gap-4 text-muted-foreground bg-accent items-center justify-center h-[40dvh] max-h-96 border overflow-hidden w-full">
				<ImageOff className="w-12 h-12" />
				No Images Available
			</div>
		);
	}

	return (
		// สร้าง Grid: โดยปกติให้สูงสักค่าหนึ่งเพื่อให้รูปเต็มสวยๆ (เช่น h-96)
		// grid-cols-2 = แบ่งเป็น 2 คอลัมน์หลัก
		// grid-rows-2 = แบ่งเป็น 2 แถวหลัก
		<div className="grid grid-cols-2 grid-rows-2 h-[40dvh] max-h-96 w-full overflow-hidden border">
			{visibleImages.map((src, index) => {
				// Logic จัดขนาดรูป:
				// - ถ้ารูปเดียว: เต็มพื้นที่
				// - ถ้าหลายรูป & เป็นรูปแรก: กินพื้นที่ 2 แถว (แนวตั้ง) หรือ 2 คอลัมน์ แล้วแต่ดีไซน์
				// - รูปอื่นๆ: กินพื้นที่ช่องเดียวปกติ

				let className = "relative w-full h-full"; // Default layout

				// Custom Grid Layout Logic
				if (images.length === 1) {
					className += " col-span-2 row-span-2"; // รูปเดียวเต็มจอ
				} else if (images.length === 2) {
					className += " row-span-2"; // 2 รูป: ทั้งสองรูปยาวลงมาทางซ้าย
				} else if (images.length >= 3 && index === 0) {
					className += " row-span-2"; // 3 รูป ขึ้นไป: รูปแรกยาวลงมาทางซ้าย
				}
				return (
					<div
						key={index}
						className={className}
						onClick={() => show(images, index)}
					>
						<Image
							src={src}
							alt={`img-${index}`}
							fill
							className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
						/>

						{/* ส่วน Overlay แสดง +X (แสดงเฉพาะรูปสุดท้าย และ ต้องมีรูปเหลือจริงๆ) */}
						{index === MAX_VISIBLE - 1 && remaining > 0 && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer group">
								<span className="text-white/60 text-3xl font-semibold group-hover:scale-110 transition-transform">
									+{remaining}
								</span>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
