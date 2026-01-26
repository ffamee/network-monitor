"use client";

import { startTransition, useActionState, useRef } from "react";
import { addZone } from "@/actions/zone-add.action";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
import { usePresignedImageUpload } from "@/components/presigned-image/logic";

interface ZoneAddFormProps {
	color: string;
	geojson: string | null;
}

export function ZoneAddForm({ color, geojson }: ZoneAddFormProps) {
	// ⭐️ STEP 1: Initialize the uploader hook to manage file uploads
	// This handles all presigned URL requests, concurrency limits (default 3), and progress tracking
	const upload = usePresignedImageUpload(3);

	// ⭐️ STEP 2: Get the server action state from useActionState hook
	// The original addZone server action handles form submission
	const [state, formAction, isPending] = useActionState(addZone, null);

	// ⭐️ STEP 3: Create a reference to access the form element in handleSubmit
	// This allows us to get all form fields (name, description, color, geojson)
	const formRef = useRef<HTMLFormElement | null>(null);

	// ⭐️ STEP 4: Custom form handler that bridges client-side file data + server action
	// This function:
	// 1. Prevents default form submission
	// 2. Gets all successful file uploads from the uploader
	// 3. Creates FormData with form fields + file data
	// 4. Manually calls the server action with combined data
	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Get successful file uploads (returns array of { key, url, name })
		const uploadedFiles = upload.getSubmitPayload();

		// Get all form fields (name, description, color, geojson)
		const form = e.currentTarget;
		const formData = new FormData(form);

		// ⭐️ STEP 5: Append file data to FormData
		// Add each file's S3 key to the form data (like hidden inputs)
		// bundle all file keys as JSON string for easy parsing in server action
		formData.append("images", JSON.stringify(uploadedFiles));
		formData.append("hasErrorFiles", upload.hasErrorFiles() ? "true" : "false");

		// ⭐️ STEP 6: Manually invoke the server action with combined FormData
		// This is equivalent to what useActionState does with <form action={formAction}>
		startTransition(() => {
			formAction(formData);
		});
	};

	return (
		<div
			className="w-full mx-auto space-y-6 text-secondary-foreground/70"
			data-testid="add-zone-form"
		>
			<div className="text-[clamp(0.5rem,3vw,1.5rem)] text-secondary-foreground/90 font-semibold">
				Add Zone Information
			</div>
			{/* ⭐️ STEP 7: Bind custom handler instead of using action prop directly */}
			{/* onSubmit={handleFormSubmit} gets file data from uploader before calling server action */}
			<form
				onSubmit={handleFormSubmit}
				className="text-sm text-black dark:text-white"
				ref={formRef}
			>
				<fieldset
					className="space-y-4 w-full transition-opacity
										disabled:[&_input]:cursor-progress disabled:[&_input]:opacity-50
										disabled:[&_button]:cursor-progress disabled:[&_button]:opacity-50"
					disabled={isPending}
				>
					{/* Hidden Fields */}
					<input type="hidden" name="color" value={color} />
					<input type="hidden" name="geojson" value={geojson ?? ""} />
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
							defaultValue={state?.inputs?.name?.toString() ?? undefined}
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
							id="floor"
							name="description"
							placeholder="enter description"
							data-error={state?.errors?.description ? "true" : undefined}
							defaultValue={state?.inputs?.description?.toString() ?? undefined}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.description && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.description.join(", ")}
							</p>
						)}
					</div>

					<div>
						{/* ⭐️ STEP 8: Replace AssignmentSubmissionPage with SmartImageInput component */}
						{/* Pass the uploader controller so files are managed properly */}
						{/* Concurrency limit is 3 files at a time (can be adjusted as needed) */}
						<SmartImageInput
							disabled={isPending}
							uploader={upload}
							name="zone_images"
							label="Zone Images"
						/>
						{state?.errors?.hasErrorFiles && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.hasErrorFiles.join(", ")}
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
