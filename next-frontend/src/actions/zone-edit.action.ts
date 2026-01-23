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
});

export type State = {
	errors?: {
		name?: string[];
		description?: string[];
		geojson?: string[];
	};
	message?: string | null;
	inputs?: { [key: string]: FormDataEntryValue };
};

// Function Signature: [Arguments from bind], [prevState], [formData]
export async function editZone(
	zoneId: string, // รับค่าจาก .bind()
	prevState: State | null, // รับค่าจาก useActionState
	formData: FormData, // รับค่าจาก Form Submit
): Promise<State> {
	// 1. Validate Form Data
	const rawData = Object.fromEntries(formData);
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
	let newSlug: { zone: string } = {
		zone: zoneId,
	};
	try {
		console.log(`Updating zone ${zoneId} with data:`, validatedFields.data);
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/zone/${zoneId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(validatedFields.data),
			},
		);
		if (!res.ok) {
			throw new Error(res.statusText);
		}
		const data = await res.json();
		newSlug = {
			zone: data.slug ?? zoneId,
		};
		// await db.building.update({ where: { id: buildingId }, data: ... })
	} catch (error) {
		return {
			message: `Update Error: ${
				error instanceof Error ? error.message : "Failed to Update Building."
			}`,
			inputs: rawData,
		};
	}

	// 4. Revalidate & Redirect
	revalidatePath(`/dashboard/${newSlug.zone}`);
	redirect(`/dashboard/${newSlug.zone}`);
}
