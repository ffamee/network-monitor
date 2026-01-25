"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { usePresignedImageUpload } from "./logic";
import Image from "next/image";

type UploadController = ReturnType<typeof usePresignedImageUpload>;

// ⭐️ Smart drag & drop uploader component
// Connects to presigned URLs and manages concurrent uploads (default 3 at a time)
// Can be imported and reused in other forms/pages
export const SmartImageInput = ({
	uploader,
	name,
	label,
}: {
	uploader: UploadController;
	name: string;
	label?: string;
}) => {
	const { files, addFiles, removeFile } = uploader;
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFiles = async (selectedFiles: File[]) => {
		if (!selectedFiles.length) return;
		await addFiles(selectedFiles);
	};

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFiles(Array.from(e.dataTransfer.files));
		}
	};

	const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		await handleFiles(Array.from(e.target.files));
		e.target.value = ""; // reset ให้เลือกไฟล์เดิมได้อีก
	};

	return (
		<div className="w-full space-y-3">
			<div className="flex justify-between items-end">
				<label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
					{label}
				</label>
				<span className="hidden mobile:block text-xs text-gray-400 text-right">
					รองรับ JPG, PNG, GIF, WEBP (Max 10MB)
				</span>
				<div
					className="block mobile:hidden"
					title="รองรับ JPG, PNG, GIF, WEBP (Max 10MB)"
				>
					<Info className="w-4 h-4 text-gray-400" />
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
				onClick={() => fileInputRef.current?.click()}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				className={`
					relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
					${
						isDragging
							? "border-blue-500 bg-blue-50 text-blue-600"
							: "border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-500"
					}
				`}
			>
				<input
					type="file"
					multiple
					accept="image/*"
					className="hidden"
					ref={fileInputRef}
					onChange={onInputChange}
				/>

				<div className="bg-white p-3 rounded-full shadow-sm mb-3">
					<UploadCloud
						className={`w-6 h-6 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
					/>
				</div>
				<p className="text-sm font-medium">
					{isDragging
						? "วางไฟล์ที่นี่..."
						: "คลิกเพื่อเลือกไฟล์ หรือลากรูปมาวาง"}
				</p>
			</div>

			{files.length > 0 && (
				<div className="grid grid-cols-1 gap-2 mt-4">
					{files.map((file) => (
						<div
							key={file.id}
							className={`
								group relative flex items-center p-2 bg-white border rounded-md shadow-sm overflow-hidden
								${file.status === "error" ? "border-red-300 bg-red-50" : "border-gray-200"}
							`}
						>
							{(file.status === "uploading" || file.status === "pending") && (
								<div
									className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 z-10"
									style={{ width: `${file.progress}%` }}
								/>
							)}

							<div className="relative w-12 h-12 shrink-0 bg-gray-100 rounded overflow-hidden mr-3 border border-gray-100">
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
							</div>

							<div className="flex-1 min-w-0 mr-2">
								<div className="flex items-center gap-2">
									<p className="text-sm font-medium text-gray-700 truncate max-w-50">
										{file.name}
									</p>
								</div>

								<div className="flex items-center text-xs text-gray-500 mt-0.5 gap-2">
									<span>{file.sizeMB} MB</span>
									<span className="text-gray-300">|</span>
									{file.status === "uploading" && (
										<span className="text-blue-600">
											กำลังอัปโหลด... {Math.round(file.progress)}%
										</span>
									)}
									{file.status === "pending" && (
										<span className="text-blue-600">เตรียมอัปโหลด...</span>
									)}
									{file.status === "success" && (
										<span className="text-green-600 flex items-center gap-1">
											<CheckCircle2 className="w-3 h-3" /> เสร็จสิ้น
										</span>
									)}
									{file.status === "error" && (
										<span className="text-red-600 flex items-center gap-1">
											<AlertCircle className="w-3 h-3" /> ล้มเหลว
										</span>
									)}
								</div>
							</div>

							<button
								type="button"
								onClick={() => removeFile(file.id)}
								className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
