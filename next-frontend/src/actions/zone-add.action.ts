"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const emptyString = (val: string) => (val === "" ? undefined : val);
// const emptyNumber = (val: string) =>
// 	val.trim() === "" ? undefined : Number(val.trim());
// Schema สำหรับ Validation
const ZoneSchema = z.object({
	name: z.preprocess(
		emptyString,
		z.string().trim().min(1, { message: "ชื่อต้องไม่ว่างเปล่า" }),
	),
	description: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "คำอธิบายต้องไม่ว่างเปล่า" })
			.optional(),
	),
	color: z.preprocess(
		emptyString,
		z.string().trim().min(1, { message: "สีต้องไม่ว่างเปล่า" }),
	),
	geojson: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "GeoJSON ต้องไม่ว่างเปล่า" })
			.transform((str, ctx) => {
				// 3. หัวใจสำคัญ: แปลง String -> JSON Object
				try {
					return JSON.parse(str);
				} catch (_e) {
					// ถ้า Parse ไม่ผ่าน (เช่น string มั่วๆ) ให้แจ้ง error กลับไป
					ctx.addIssue({
						code: "custom",
						message: "รูปแบบ JSON ไม่ถูกต้อง (Invalid JSON string)",
					});
					return z.NEVER;
				}
			})
			// 4. (Optional) ตรวจซ้ำอีกทีว่าผลลัพธ์ที่ได้เป็น Object จริงไหม
			.pipe(z.record(z.string(), z.any()))
			.optional(),
	),
	// validate images to be an array of objects with filename string property
	images: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "images ต้องไม่ว่างเปล่า" })
			.transform((str, ctx) => {
				try {
					const parsed = JSON.parse(str);
					if (!Array.isArray(parsed)) {
						throw new Error("Not an array");
					}
					return parsed;
				} catch (_e) {
					ctx.addIssue({
						code: "custom",
						message: "รูปแบบ images ไม่ถูกต้อง (Invalid images format)",
					});
					return z.NEVER;
				}
			})
			.pipe(
				z.array(
					z.object({
						filename: z.string().min(1, {
							message: "filename ต้องไม่ว่างเปล่า",
						}),
					}),
				),
			)
			.optional(),
	),
	// validate hasErrorFiles to be a string "true" or "false" (invalid data if it "true")
	hasErrorFiles: z.preprocess(
		emptyString,
		z.enum(["true", "false"]).transform((str, ctx) => {
			try {
				if (str === "true") throw new Error("ตรวจสอบไฟล์ที่อัปโหลดอีกครั้ง");
				return false;
			} catch (error) {
				ctx.addIssue({
					code: "custom",
					message:
						error instanceof Error
							? error.message
							: "Invalid hasErrorFiles value",
				});
				return z.NEVER;
			}
		}),
	),
});

export type State = {
	errors?: {
		name?: string[];
		description?: string[];
		hasErrorFiles?: string[];
	};
	message?: string | null;
	inputs?: { [key: string]: FormDataEntryValue };
};

// Function Signature: [Arguments from bind], [prevState], [formData]
export async function addZone(
	// zoneId: string, // รับค่าจาก .bind()
	prevState: State | null, // รับค่าจาก useActionState
	formData: FormData, // รับค่าจาก Form Submit
): Promise<State> {
	// 1. Validate Form Data
	const rawData = Object.fromEntries(formData);
	console.log("Raw Form Data:", rawData);
	const validatedFields = ZoneSchema.safeParse(rawData);

	// console.log("validatedFields:", validatedFields);

	// 2. ถ้า Validate ไม่ผ่าน Return Error กลับไป
	if (!validatedFields.success) {
		return {
			// errors: validatedFields.error.flatten().fieldErrors,
			// errors: z.treeifyError(validatedFields.error),
			errors: z.flattenError(validatedFields.error).fieldErrors,
			message: "กรุณาตรวจสอบข้อมูลอีกครั้ง",
			inputs: rawData,
		};
	}

	// 3. Update Database
	let newSlug: { zone: string } = { zone: "" };
	try {
		console.log(`Adding zone with data:`, validatedFields.data);
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(validatedFields.data),
		});
		if (!res.ok) {
			throw new Error(res.statusText);
		}
		const data = await res.json();
		console.log("Add Zone Response:", data);
		newSlug = {
			zone: data.slug ?? "",
		};
	} catch (error) {
		return {
			message: `Add Error: ${
				error instanceof Error ? error.message : "Failed to Add Zone."
			}`,
			inputs: rawData,
		};
	}

	// 4. Revalidate & Redirect
	revalidatePath(`/dashboard/${newSlug.zone}`);
	redirect(`/dashboard/${newSlug.zone}`);
}
