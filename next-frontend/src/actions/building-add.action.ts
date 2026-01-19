"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const emptyString = (val: string) => (val === "" ? undefined : val);
const emptyNumber = (val: string) =>
	val.trim() === "" ? undefined : Number(val.trim());
// Schema สำหรับ Validation
const BuildingSchema = z.object({
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
	admin: z.preprocess(
		emptyString,
		z
			.string()
			.trim()
			.min(1, { message: "ชื่อผู้ดูแลต้องไม่ว่างเปล่า" })
			.optional(),
	),
	tel: z.preprocess(
		emptyString,
		z
			.string()
			.regex(/^0\d{2}-\d{3}-\d{4}$/, {
				message: "รูปแบบเบอร์โทรต้องเป็น 0xx-xxx-xxxx",
			})
			.optional(),
	),
	zoneId: z.preprocess(
		emptyString,
		z.string().trim().min(1, { message: "Zone ID ต้องไม่ว่างเปล่า" }),
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
	placeId: z.preprocess(emptyString, z.string().trim().optional()),
	address: z.preprocess(emptyString, z.string().trim().optional()),
});

export type State = {
	errors?: {
		name?: string[];
		floor?: string[];
		admin?: string[];
		tel?: string[];
		zoneId?: string[];
		lat?: string[];
		lng?: string[];
	};
	message?: string | null;
	inputs?: { [key: string]: FormDataEntryValue };
};

// Function Signature: [Arguments from bind], [prevState], [formData]
export async function addBuilding(
	zoneId: string, // รับค่าจาก .bind()
	prevState: State | null, // รับค่าจาก useActionState
	formData: FormData, // รับค่าจาก Form Submit
): Promise<State> {
	// 1. Validate Form Data
	const rawData = Object.fromEntries(formData);
	console.log("rawData:", rawData);
	const validatedFields = BuildingSchema.safeParse({ ...rawData, zoneId });

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
	let newSlug: { zone: string; building: string } = {
		zone: zoneId ?? "zone-a",
		building: "",
	};
	try {
		console.log(
			`Add new building to ${zoneId} with data:`,
			validatedFields.data,
		);
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/building`, {
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
		newSlug = {
			zone: data.zoneId ?? "zone-a",
			building: data.building,
		};
		// await db.building.update({ where: { id: buildingId }, data: ... })
	} catch (error) {
		return {
			message: `Adding Error: ${
				error instanceof Error ? error.message : "Failed to Add Building."
			}`,
			inputs: rawData,
		};
	}

	// 4. Revalidate & Redirect
	revalidatePath(`/dashboard/${newSlug.zone}/${newSlug.building}`);
	redirect(`/dashboard/${newSlug.zone}/${newSlug.building}`);
}
