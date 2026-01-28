"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const emptyString = (val: string) => (val === "" ? undefined : val);
const emptyNumber = (val: string) =>
	val.trim() === "" ? undefined : Number(val.trim());
// Schema สำหรับ Validation
const ProbeSchema = z.object({
	name: z.preprocess(
		emptyString,
		z.string().trim().min(1, { message: "ชื่อต้องไม่ว่างเปล่า" }),
	),
	floor: z.preprocess(
		emptyNumber,
		z
			.int({ message: "ชั้นต้องเป็นเลขจำนวนเต็ม" })
			.min(0, { message: "ชั้นต้องมากกว่าเท่ากับ 0" })
			.optional(),
	),
	serialNumber: z.preprocess(
		emptyString,
		z.string().trim().min(1, { message: "หมายเลขเครื่องต้องไม่ว่างเปล่า" }),
	),
	buildingId: z.preprocess(
		emptyNumber,
		z
			.int({ message: "ชั้นต้องเป็นเลขจำนวนเต็ม" })
			.min(0, { message: "ชั้นต้องมากกว่าเท่ากับ 0" }),
	),
	lat: z.preprocess(
		emptyNumber,
		z
			.number({ message: "ละติจูดต้องเป็นตัวเลข" })
			.min(-90, { message: "ละติจูดต้องไม่น้อยกว่า -90" })
			.max(90, { message: "ละติจูดต้องไม่เกิน 90" }),
	),
	lng: z.preprocess(
		emptyNumber,
		z
			.number({ message: "ลองจิจูดต้องเป็นตัวเลข" })
			.min(-180, { message: "ลองจิจูดต้องไม่น้อยกว่า -180" })
			.max(180, { message: "ลองจิจูดต้องไม่เกิน 180" }),
	),
	placeId: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "Place ID ต้องไม่ว่างเปล่า" })
			.optional(),
	),
	address: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "Address ต้องไม่ว่างเปล่า" })
			.optional(),
	),
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
	deletedImages: z.preprocess(
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
		floor?: string[];
		serialNumber?: string[];
		buildingId?: string[];
		lat?: string[];
		lng?: string[];
		hasErrorFiles?: string[];
	};
	message?: string | null;
	inputs?: { [key: string]: FormDataEntryValue };
};

// Function Signature: [Arguments from bind], [prevState], [formData]
export async function editProbe(
	probeId: string, // รับค่าจาก .bind()
	prevState: State | null, // รับค่าจาก useActionState
	formData: FormData, // รับค่าจาก Form Submit
): Promise<State> {
	// 1. Validate Form Data
	const rawData = Object.fromEntries(formData);
	console.log("rawData:", rawData);
	const validatedFields = ProbeSchema.safeParse({ ...rawData, probeId });

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
	let newSlug: { zone: string; building: string; probe: string } = {
		zone: "",
		building: "",
		probe: "",
	};
	try {
		console.log(`Update probe ${probeId} with data:`, validatedFields.data);
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/probe/${probeId}`,
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
			zone: data.zone.slug,
			building: data.building.slug,
			probe: data.slug,
		};
		// await db.building.update({ where: { id: buildingId }, data: ... })
	} catch (error) {
		return {
			message: `Update Error: ${
				error instanceof Error ? error.message : "Failed to Update Probe."
			}`,
			inputs: rawData,
		};
	}

	// 4. Revalidate & Redirect
	revalidatePath(
		`/dashboard/${newSlug.zone}/${newSlug.building}/${newSlug.probe}`,
	);
	redirect(`/dashboard/${newSlug.zone}/${newSlug.building}/${newSlug.probe}`);
}
