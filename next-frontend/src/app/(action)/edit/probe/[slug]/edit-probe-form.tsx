"use client";

import { useActionState } from "react";
import { LocationInfo } from "@/app/(action)/add/building/[slug]/page";
import { RotateCcw } from "lucide-react";
import { editProbe } from "@/actions/probe-edit.action";

export function ProbeEditForm({
	slug,
	probe,
	location,
	displayMode = "full",
	fetchPlace,
}: {
	slug: string;
	probe: {
		name: string;
		lat: number;
		lng: number;
		placeId: string | null;
		address: string;
		floor?: number;
		ip: string;
		serialNumber: string;
		buildingId: string;
		// other building properties...
	};
	location: LocationInfo | null;
	displayMode?: "full" | "modal";
	fetchPlace?: () => Promise<void>;
}) {
	// ⭐️ KEY POINT: สร้าง version ของ action ที่มี id ฝังอยู่แล้ว
	// null ตัวแรกคือ context (this) ซึ่งใน server action เราไม่ใช้
	const editProbeWithId = editProbe.bind(null, slug);

	// ส่ง bound action เข้าไปใน hook
	const [state, formAction, isPending] = useActionState(editProbeWithId, null);

	return (
		<div
			className="w-full mx-auto space-y-6 text-secondary-foreground/70"
			data-testid="add-building-form"
		>
			<div className="text-[clamp(0.5rem,3vw,1.5rem)] text-secondary-foreground/90 font-semibold">
				Edit Probe
			</div>
			<form action={formAction} className="text-sm text-black dark:text-white">
				<fieldset
					className="space-y-4 w-full transition-opacity
										disabled:[&_input]:cursor-progress disabled:[&_input]:opacity-50
										disabled:[&_button]:cursor-progress disabled:[&_button]:opacity-50"
					disabled={isPending}
				>
					{/* Hidden Fields */}
					<input type="hidden" name="placeId" value={location?.placeId ?? ""} />
					{/* Non-Editable Fields */}
					<div
						data-display={displayMode}
						className="grid grid-cols-2 gap-4 opacity-70 data-[display=modal]:hidden"
					>
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
								state?.inputs?.name?.toString() ?? location?.name ?? probe.name
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
							defaultValue={state?.inputs?.floor?.toString() ?? probe.floor}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.floor && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.floor.join(", ")}
							</p>
						)}
					</div>

					{/* Serial Number Input */}
					<div>
						<label
							htmlFor="serialNumber"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							Serial Number
						</label>
						<input
							id="serialNumber"
							name="serialNumber"
							placeholder="enter serial number"
							data-error={state?.errors?.serialNumber ? "true" : undefined}
							defaultValue={
								state?.inputs?.serialNumber?.toString() ?? probe.serialNumber
							}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.serialNumber && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.serialNumber.join(", ")}
							</p>
						)}
					</div>
					{/* IPv4 Input */}
					<div>
						<label
							htmlFor="ip"
							className="block text-sm font-medium mb-2 text-secondary-foreground/70"
						>
							IP Address
						</label>
						<input
							id="ip"
							name="ip"
							placeholder="enter IP address"
							data-error={state?.errors?.ip ? "true" : undefined}
							defaultValue={state?.inputs?.ip?.toString() ?? probe.ip}
							className="border p-2 w-full rounded focus:outline-none focus:border-primary/75 focus:border-2 placeholder:text-xs
												data-[error=true]:border-rose-600 data-[error=true]:dark:border-rose-500"
						/>
						{state?.errors?.ip && (
							<p className="text-rose-600 dark:text-rose-500 text-sm mt-1">
								{state.errors.ip.join(", ")}
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
							{isPending ? "Adding..." : "Add Probe"}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
}
