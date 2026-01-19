"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CalendarButton({
	date,
	color,
}: {
	date: Date | null;
	color: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleClick = () => {
		if (!date) return;
		// if date future, return
		const now = new Date();
		console.log(
			date.toLocaleDateString("en-CA", {
				timeZone: "Asia/Bangkok",
			}),
			now.toLocaleDateString("en-CA", {
				timeZone: "Asia/Bangkok",
			})
		);
		if (date > now) return;

		const params = new URLSearchParams(searchParams);

		// Format date in Thailand timezone
		const dateStr = date.toLocaleDateString("en-CA", {
			timeZone: "Asia/Bangkok",
		});

		// Logic Toggle: ถ้าเลือกวันเดิม ให้ลบ parameter ทิ้ง
		if (searchParams.get("date") === dateStr) {
			params.delete("date");
		} else {
			params.set("date", dateStr);
		}
		params.set("page", "1"); // Reset pagination เมื่อเปลี่ยนวัน

		// ใช้ replace เพื่อไม่ให้รก History และ scroll: false เพื่อไม่ให้หน้ากระตุก
		router.replace(`?${params.toString()}`, { scroll: false });
	};

	return (
		<div
			onClick={handleClick}
			className={`aspect-square rounded-md transition-all duration-200 relative group ${color} hover:scale-105`}
		>
			{date && (
				<div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-stone-800 text-white text-xs rounded border border-slate-700 whitespace-nowrap z-10 pointer-events-none">
					{date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						timeZone: "Asia/Bangkok",
					})}
				</div>
			)}
		</div>
	);
}
