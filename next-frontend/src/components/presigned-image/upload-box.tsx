"use client";

import React, { useRef, useState } from "react";
import {
	UploadCloud,
	X,
	CheckCircle2,
	AlertCircle,
	Info,
	AlertTriangle,
} from "lucide-react";
import { usePresignedImageUpload } from "./logic";
import Image from "next/image";

type UploadController = ReturnType<typeof usePresignedImageUpload>;

// ⭐️ Smart drag & drop uploader component with theme-aware styling
// Connects to presigned URLs and manages concurrent uploads (default 3 at a time)
// Responsive design with support for pending, uploading, success, and error states
export const SmartImageInput = ({
	uploader,
	name,
	label,
	disabled = false,
}: {
	uploader: UploadController;
	name: string;
	label?: string;
	disabled?: boolean;
}) => {
	const { files, addFiles, removeFile } = uploader;
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFiles = async (selectedFiles: File[]) => {
		if (!selectedFiles.length || disabled) return;
		await addFiles(selectedFiles);
	};

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!disabled) setIsDragging(true);
	};

	const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFiles(Array.from(e.dataTransfer.files));
		}
	};

	const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		await handleFiles(Array.from(e.target.files));
		e.target.value = ""; // reset ให้เลือกไฟล์เดิมได้อีก
	};

	const hasErrors = files.some((f) => f.status === "error");
	const isPending = files.some(
		(f) => f.status === "pending" || f.status === "uploading",
	);

	return (
		<div className="w-full space-y-3">
			<div className="flex justify-between items-end gap-2">
				<label className="text-sm font-semibold text-secondary-foreground/70 flex items-center gap-2">
					{label}
					{disabled && (
						<span className="text-xs text-muted-foreground">(disabled)</span>
					)}
				</label>
				<span className="hidden mobile:block text-xs text-muted-foreground text-right">
					รองรับ JPG, PNG, GIF, WEBP (Max 10MB)
				</span>
				<div
					className="block mobile:hidden"
					title="รองรับ JPG, PNG, GIF, WEBP (Max 10MB)"
				>
					<Info className="w-4 h-4 text-muted-foreground" />
				</div>
			</div>

			{files
				.filter((f) => f.status === "success")
				.map((f) => (
					<input
						key={f.id}
						type="hidden"
						name={name}
						value={f.s3Key || f.uploadedUrl || ""}
					/>
				))}

			<div
				onClick={() => !disabled && fileInputRef.current?.click()}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				className={`
					relative border-2 border-dashed rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
					${disabled ? "opacity-50 cursor-not-allowed bg-muted/50 border-border" : ""}
					${
						isDragging
							? "border-primary bg-primary/5 text-primary dark:bg-primary/10"
							: hasErrors
								? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10 text-destructive hover:border-destructive/60"
								: "border-border hover:border-primary/60 hover:bg-primary/5 text-muted-foreground dark:hover:bg-primary/10 dark:text-muted-foreground"
					}
				`}
			>
				<input
					type="file"
					multiple
					disabled={disabled}
					accept="image/*"
					className="hidden"
					ref={fileInputRef}
					onChange={onInputChange}
				/>

				<div className="bg-card/80 dark:bg-card p-3 md:p-4 rounded-full shadow-sm mb-3 border border-border">
					<UploadCloud
						className={`w-6 h-6 md:w-8 md:h-8 transition-colors ${
							isDragging
								? "text-primary"
								: hasErrors
									? "text-destructive"
									: "text-muted-foreground"
						}`}
					/>
				</div>
				<p className="text-xs sm:text-sm font-medium">
					{isDragging
						? "วางไฟล์ที่นี่..."
						: isPending
							? "กำลังอัปโหลด..."
							: "คลิกเพื่อเลือกไฟล์ หรือลากรูปมาวาง"}
				</p>
				{hasErrors && (
					<p className="text-xs text-destructive mt-1 flex items-center gap-1 justify-center">
						<AlertTriangle className="w-3 h-3" />
						กรุณาตรวจสอบการอัปโหลดที่ล้มเหลว
					</p>
				)}
			</div>

			{files.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
					{files.map((file) => (
						<div
							key={file.id}
							className={`
								group relative flex flex-col p-3 rounded-md border transition-all duration-200
								${
									file.status === "error"
										? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
										: file.status === "success"
											? "border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
											: file.status === "pending" || file.status === "uploading"
												? "border-primary/30 bg-primary/5 dark:bg-primary/10"
												: "border-border bg-card/50 dark:bg-card"
								}
								${disabled ? "opacity-50" : ""}
							`}
						>
							{(file.status === "uploading" || file.status === "pending") && (
								<div
									className="absolute top-0 left-0 h-1 bg-linear-to-r from-primary to-secondary transition-all duration-300 z-10 rounded-t-md"
									style={{ width: `${file.progress}%` }}
								/>
							)}

							<div className="flex gap-3">
								<div className="relative w-16 h-16 shrink-0 bg-muted rounded overflow-hidden border border-border">
									<Image
										fill
										src={file.preview}
										alt="preview"
										className="w-full h-full object-cover"
									/>
									{file.status === "uploading" && (
										<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										</div>
									)}
									{file.status === "error" && (
										<div className="absolute inset-0 bg-destructive/40 flex items-center justify-center">
											<AlertCircle className="w-5 h-5 text-white" />
										</div>
									)}
									{file.status === "success" && (
										<div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
											<CheckCircle2 className="w-5 h-5 text-white" />
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0 flex flex-col justify-between">
									<div>
										<p className="text-xs sm:text-sm font-medium text-foreground truncate">
											{file.name}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{file.sizeMB} MB
										</p>
									</div>

									<div className="flex items-center gap-1.5">
										{file.status === "uploading" && (
											<span className="text-xs font-medium text-primary">
												กำลังอัปโหลด {Math.round(file.progress)}%
											</span>
										)}
										{file.status === "pending" && (
											<span className="text-xs font-medium text-primary">
												กำลังเตรียม...
											</span>
										)}
										{file.status === "success" && (
											<span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
												<CheckCircle2 className="w-3 h-3" /> เสร็จสิ้น
											</span>
										)}
										{file.status === "error" && (
											<span className="text-xs font-medium text-destructive flex items-center gap-0.5">
												<AlertCircle className="w-3 h-3" /> ล้มเหลว
											</span>
										)}
									</div>
								</div>
							</div>

							<button
								type="button"
								onClick={() => removeFile(file.id)}
								disabled={disabled || file.status === "uploading"}
								className={`
									absolute -top-2 -right-2 p-1.5 rounded-full transition-all duration-200 border border-border
									${
										file.status === "uploading" || disabled
											? "opacity-30 cursor-not-allowed"
											: "bg-card dark:bg-muted hover:bg-destructive/10 hover:border-destructive/50 text-muted-foreground hover:text-destructive"
									}
								`}
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
