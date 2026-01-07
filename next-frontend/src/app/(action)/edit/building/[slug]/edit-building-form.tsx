"use client";

import { useActionState } from "react";
import { editBuilding } from "@/actions/building-edit.action";

export function BuildingEdit({
	slug,
	building,
}: {
	slug: string;
	building: { name?: string; floor?: number; admin?: string; tel?: string };
}) {
	// ⭐️ KEY POINT: สร้าง version ของ action ที่มี id ฝังอยู่แล้ว
	// null ตัวแรกคือ context (this) ซึ่งใน server action เราไม่ใช้
	const editBuildingWithId = editBuilding.bind(null, slug);

	// ส่ง bound action เข้าไปใน hook
	const [state, formAction, isPending] = useActionState(
		editBuildingWithId,
		null
	);

	return (
		<div className="w-full mx-auto space-y-6 text-secondary-foreground/70">
			<div className="text-[clamp(0.5rem,3vw,1.5rem)] text-secondary-foreground/90 font-semibold">
				Edit Building Infomation
			</div>
			<form action={formAction} className="text-sm text-black dark:text-white">
				<fieldset
					className="space-y-4 w-full transition-opacity
										disabled:[&_input]:cursor-progress disabled:[&_input]:opacity-50
										disabled:[&_button]:cursor-progress disabled:[&_button]:opacity-50"
					disabled={isPending}
				>
					{/* Name Input */}
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Name
							<span className="text-rose-600 dark:text-rose-500">*</span>
						</label>
						<input
							id="name"
							name="name"
							placeholder="enter name"
							required
							data-error={state?.errors?.name ? "true" : undefined}
							defaultValue={state?.inputs?.name?.toString() ?? building.name}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500
												invalid:border-rose-600 invalid:dark:border-rose-500
												invalid:placeholder:text-rose-600/70 invalid:dark:placeholder:text-rose-500/70
												invalid:focus:border-rose-600 invalid:dark:focus:border-rose-500"
						/>
						{/* Error Message */}
						{state?.errors?.name && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.name.join(", ")}
							</p>
						)}
					</div>

					{/* Floor Input */}
					<div>
						<label
							htmlFor="floor"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Floor
						</label>
						<input
							id="floor"
							name="floor"
							placeholder="enter floor e.g. 3"
							data-error={state?.errors?.floor ? "true" : undefined}
							defaultValue={state?.inputs?.floor?.toString() ?? building.floor}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.floor && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.floor.join(", ")}
							</p>
						)}
					</div>

					{/* Admin Input */}
					<div>
						<label
							htmlFor="admin"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Admin
						</label>
						<input
							id="admin"
							name="admin"
							placeholder="enter admin name"
							data-error={state?.errors?.admin ? "true" : undefined}
							defaultValue={state?.inputs?.admin?.toString() ?? building.admin}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.admin && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.admin.join(", ")}
							</p>
						)}
					</div>

					{/* Tel Input */}
					<div>
						<label
							htmlFor="tel"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Tel
						</label>
						<input
							id="tel"
							name="tel"
							placeholder="enter tel number"
							data-error={state?.errors?.tel ? "true" : undefined}
							defaultValue={state?.inputs?.tel?.toString() ?? building.tel}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.tel && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.tel.join(", ")}
							</p>
						)}
					</div>

					{/* Global Error Message */}
					{state?.message && (
						<p className="text-rose-600 dark:text-rose-500 font-bold">
							{state.message}
						</p>
					)}

					{/* Submit Button */}
					<div className="flex justify-end mt-8 items-end-safe">
						<button
							type="submit"
							className="bg-primary text-white px-4 py-2 rounded hover:scale-105 transition-all cursor-pointer"
						>
							{isPending ? "Updating..." : "Save Changes"}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
}
