"use client";

import { startTransition, useActionState, useRef } from "react";
import { editZone } from "@/actions/zone-edit.action";
import { Zone } from "@/models/zone";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
import { usePresignedImageUpload } from "@/components/presigned-image/logic";

interface EditZoneFormProps {
	zone: Zone;
	paths: string | null;
	color: string;
	zoneId: string;
}

export function ZoneEditForm({
	zone,
	paths,
	color,
	zoneId,
}: EditZoneFormProps) {
	// ⭐️ STEP 1: Initialize the uploader hook for managing file uploads AND deletions
	// It handles presigned URLs, concurrent uploads (default 3), progress tracking,
	// and tracks which old files are marked for deletion
	const upload = usePresignedImageUpload(3);

	// ⭐️ STEP 2: Create a version of the action with zone id bound
	// null ตัวแรกคือ context (this) ซึ่งใน server action เราไม่ใช้
	const editZoneWithId = editZone.bind(null, zoneId);

	// ⭐️ STEP 3: Get the server action state from useActionState hook
	const [state, formAction, isPending] = useActionState(editZoneWithId, null);

	// ⭐️ STEP 4: Create a reference to access the form element in handleSubmit
	const formRef = useRef<HTMLFormElement | null>(null);

	// ⭐️ STEP 5: Custom form handler that bridges client-side file data + server action
	// This function:
	// 1. Prevents default form submission
	// 2. Gets all successful new file uploads from the uploader
	// 3. Gets all files marked for deletion from the uploader
	// 4. Creates FormData with form fields + file data
	// 5. Manually calls the server action with combined data
	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Get successful new file uploads (returns array of { filename: "path/to/file" })
		const newImages = upload.getSubmitPayload();

		// ⭐️ Get deleted images from hook (NOT separate state!)
		const deletedImages = upload.getDeletedImages();

		// Get all form fields (name, description, color, geojson)
		const form = e.currentTarget;
		const formData = new FormData(form);

		// ⭐️ STEP 6: Append file data to FormData
		// Bundle new file keys as JSON string for easy parsing in server action
		formData.append("images", JSON.stringify(newImages));

		// ⭐️ Append deleted images list
		// Server will use this to remove marked files and update the database
		formData.append("deletedImages", JSON.stringify(deletedImages));
		formData.append("hasErrorFiles", upload.hasErrorFiles() ? "true" : "false");

		// ⭐️ STEP 7: Manually invoke the server action with combined FormData
		// ⭐️ IMPORTANT: Wrap in startTransition when preventing default form behavior
		startTransition(() => {
			formAction(formData);
		});
	};

	return (
		<div
			className="w-full mx-auto space-y-6 text-secondary-foreground/70"
			data-testid="edit-zone-form"
		>
			<div className="text-[clamp(0.5rem,3vw,1.5rem)] text-secondary-foreground/90 font-semibold">
				Edit Zone Information
			</div>
			{/* ⭐️ STEP 8: Bind custom handler instead of using action prop directly */}
			{/* onSubmit={handleFormSubmit} gets file data from uploader before calling server action */}
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
					{/* Hidden Input */}
					<input type="hidden" name="color" value={color} />
					<input type="hidden" name="geojson" value={paths || ""} />

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
							defaultValue={state?.inputs?.name?.toString() ?? zone.name}
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

					{/* Description Input */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Description
						</label>
						<input
							id="description"
							name="description"
							placeholder="enter description"
							data-error={state?.errors?.description ? "true" : undefined}
							defaultValue={
								state?.inputs?.description?.toString() ?? zone.description
							}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.description && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.description.join(", ")}
							</p>
						)}
					</div>

					{/* ⭐️ STEP 9: Image component handles both existing images display + new uploads */}
					{/* Just pass existingImages prop and let SmartImageInput handle the display */}
					<div>
						<SmartImageInput
							disabled={isPending}
							uploader={upload}
							name="zone_images"
							label="Images"
							existingImages={zone.images || []}
						/>
						{state?.errors?.hasErrorFiles && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.hasErrorFiles.join(", ")}
							</p>
						)}
					</div>

					{/* Hidden Error Message */}
					{/* {state?.errors?.geojson && (
						<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
							{state.errors.geojson.join(", ")}
						</p>
					)} */}

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
