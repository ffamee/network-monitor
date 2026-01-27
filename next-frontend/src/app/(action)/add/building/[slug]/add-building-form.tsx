"use client";

import { addBuilding } from "@/actions/building-add.action";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
import { usePresignedImageUpload } from "@/components/presigned-image/logic";
import { startTransition, useActionState, useRef } from "react";
import { LocationInfo } from "./page";
import { RotateCcw } from "lucide-react";

export function BuildingAddForm({
	zoneId,
	location,
	fetchPlace,
}: {
	zoneId: string;
	location: LocationInfo | null;
	fetchPlace: () => Promise<void>;
}) {
	// Manage presigned uploads and keep progress/errors in sync with the form
	const upload = usePresignedImageUpload(3);
	const formRef = useRef<HTMLFormElement | null>(null);
	// ⭐️ KEY POINT: สร้าง version ของ action ที่มี id ฝังอยู่แล้ว
	const addBuildingWithId = addBuilding.bind(null, zoneId);
	// ส่ง bound action เข้าไปใน hook
	const [state, formAction, isPending] = useActionState(
		addBuildingWithId,
		null,
	);

	// Custom submit to merge uploaded file data with regular fields
	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const uploadedFiles = upload.getSubmitPayload();
		const form = e.currentTarget;
		const formData = new FormData(form);

		formData.append("images", JSON.stringify(uploadedFiles));
		formData.append("hasErrorFiles", upload.hasErrorFiles() ? "true" : "false");

		startTransition(() => {
			formAction(formData);
		});
	};

	return (
		<div
			className="w-full mx-auto space-y-6 text-secondary-foreground/70"
			data-testid="add-building-form"
		>
			<div className="text-[clamp(0.5rem,3vw,1.5rem)] text-secondary-foreground/90 font-semibold">
				Add New Building
			</div>
			<form
				onSubmit={handleFormSubmit}
				className="text-sm text-black dark:text-white max-h-[75dvh] overflow-y-auto no-scrollbar"
				ref={formRef}
			>
				<fieldset
					className="space-y-4 w-full transition-opacity
										disabled:[&_input]:cursor-progress disabled:[&_input]:opacity-50
										disabled:[&_button]:cursor-progress disabled:[&_button]:opacity-50"
					disabled={isPending}
				>
					{/* Hidden Fields */}
					<input type="hidden" name="placeId" value={location?.placeId ?? ""} />
					{/* Non-Editable Fields */}
					<div className="grid grid-cols-2 gap-4 opacity-70">
						<div>
							<label
								htmlFor="lat"
								className="block text-sm font-medium mb-2 text-secondary-foreground/70"
							>
								Latitude
								<span className="text-rose-600 dark:text-rose-500">*</span>
							</label>
							<input
								id="lat"
								name="lat"
								placeholder="latitude"
								value={location?.lat.toString() ?? ""}
								readOnly
								required
								className="border p-2 w-full rounded placeholder:text-xs pointer-events-none text-muted-foreground"
							/>
							{/* Error Message */}
							{state?.errors?.lat && (
								<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
									{state.errors.lat.join(", ")}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="lng"
								className="block text-sm font-medium mb-2 text-secondary-foreground/70"
							>
								Longitude
								<span className="text-rose-600 dark:text-rose-500">*</span>
							</label>
							<input
								id="lng"
								name="lng"
								placeholder="longitude"
								value={location?.lng.toString() ?? ""}
								readOnly
								required
								className="border p-2 w-full rounded placeholder:text-xs pointer-events-none text-muted-foreground"
							/>
							{/* Error Message */}
							{state?.errors?.lng && (
								<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
									{state.errors.lng.join(", ")}
								</p>
							)}
						</div>
						<div className="col-span-2 flex gap-4">
							<div className="w-full">
								<label
									htmlFor="address"
									className="block text-sm font-medium mb-2 text-secondary-foreground/70"
								>
									Address
								</label>
								<input
									id="address"
									name="address"
									placeholder="address"
									value={location?.address ?? ""}
									readOnly
									className="border p-2 w-full rounded placeholder:text-xs pointer-events-none text-muted-foreground truncate"
								/>
							</div>
							<button
								type="button"
								className="bg-primary rounded px-2 aspect-square h-full flex items-center justify-center"
								onClick={fetchPlace}
							>
								<RotateCcw size={20} />
							</button>
						</div>
					</div>
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
							defaultValue={
								state?.inputs?.name?.toString() ?? location?.name ?? undefined
							}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500
												user-invalid:border-rose-600 user-invalid:dark:border-rose-500
												user-invalid:placeholder:text-rose-600/70 user-invalid:dark:placeholder:text-rose-500/70
												user-invalid:focus:border-rose-600 user-invalid:dark:focus:border-rose-500"
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
							defaultValue={state?.inputs?.floor?.toString() ?? undefined}
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
							defaultValue={state?.inputs?.admin?.toString() ?? undefined}
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
							defaultValue={state?.inputs?.tel?.toString() ?? undefined}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.tel && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.tel.join(", ")}
							</p>
						)}
					</div>

					<div>
						<SmartImageInput
							disabled={isPending}
							uploader={upload}
							name="building_images"
							label="Building Images"
						/>
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
							{isPending ? "Adding..." : "Add Building"}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
}
