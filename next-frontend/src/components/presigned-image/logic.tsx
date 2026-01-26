"use client";
import { useMemo, useState } from "react";
import axios from "axios";
import pLimit from "p-limit";
import { v4 as uuidv4 } from "uuid";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export type UploadFile = {
	id: string;
	name: string;
	sizeMB: number;
	file: File;
	preview: string;
	status: UploadStatus;
	progress: number;
	s3Key: string | null;
	uploadedUrl: string | null;
};

type PresignedResponse = {
	url: string;
	key: string;
	originalName?: string;
};

const DEFAULT_CONCURRENCY = 3;

// Hook แยก logic อัปโหลดด้วย presigned URL + จำกัด concurrency ด้วย p-limit
export function usePresignedImageUpload(concurrency = DEFAULT_CONCURRENCY) {
	const limit = useMemo(() => pLimit(concurrency), [concurrency]);
	const [files, setFiles] = useState<UploadFile[]>([]);

	const addFiles = async (selected: File[]) => {
		if (!selected.length) return;

		const prepared = selected.map<UploadFile>((file) => ({
			id: uuidv4(),
			name: file.name,
			sizeMB: Number((file.size / 1024 / 1024).toFixed(2)),
			file,
			preview: URL.createObjectURL(file),
			status: "pending",
			progress: 0,
			s3Key: null,
			uploadedUrl: null,
		}));

		setFiles((prev) => [...prev, ...prepared]);
		await processUploadQueue(prepared);
	};

	const processUploadQueue = async (newFiles: UploadFile[]) => {
		try {
			const payload = newFiles.map((f) => ({
				name: f.name,
				type: f.file.type,
			}));
			const { data: presignedList } = await axios.post<
				PresignedResponse[] | null[]
			>(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/minio/get-presigned-urls`,
				payload,
			);

			const uploadTasks = newFiles.map((fileObj, index) => {
				const presignedInfo = presignedList[index];
				return limit(() =>
					uploadSingleFile(fileObj.id, fileObj.file, presignedInfo),
				);
			});

			await Promise.allSettled(uploadTasks);
		} catch (error) {
			console.error("Error getting presigned URLs", error);
		}
	};

	const uploadSingleFile = async (
		fileId: string,
		file: File,
		presignedInfo: PresignedResponse | null,
	) => {
		if (!presignedInfo) {
			console.error(`No presigned info for file ${file.name}`);
			updateFileState(fileId, { status: "error" });
			return;
		}
		updateFileState(fileId, {
			status: "uploading",
			s3Key: presignedInfo.key,
			uploadedUrl: presignedInfo.url.split("?")[0],
		});

		try {
			await axios.put(presignedInfo.url, file, {
				headers: { "Content-Type": file.type },
				onUploadProgress: (event) => {
					const percent = Math.round((event.loaded * 100) / (event.total || 1));
					updateFileState(fileId, { progress: percent });
				},
			});

			updateFileState(fileId, { status: "success", progress: 100 });
		} catch (error) {
			console.error(`Upload failed for ${file.name}`, error);
			updateFileState(fileId, { status: "error" });
		}
	};

	const removeFile = (id: string) => {
		setFiles((prev) => prev.filter((f) => f.id !== id));
	};

	const getSubmitPayload = () =>
		files
			.filter((f) => f.status === "success")
			// .map((f) => ({ key: f.s3Key, url: f.uploadedUrl, name: f.name }));
			.map((f) => ({ filename: f.s3Key || "" }));

	const hasErrorFiles = () => files.some((f) => f.status !== "success");

	const reset = () => setFiles([]);

	const updateFileState = (id: string, updates: Partial<UploadFile>) => {
		setFiles((prev) =>
			prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
		);
	};

	return {
		files,
		addFiles,
		removeFile,
		getSubmitPayload,
		hasErrorFiles,
		reset,
	};
}
