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
	// buildingId: z.preprocess(
	// 	emptyString,
	// 	z.string().trim().min(1, { message: "Building ID ต้องไม่ว่างเปล่า" }),
	// ),
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
	// ipv4 field use z.ipv4
	ip: z.preprocess(
		emptyString,
		z.ipv4({ message: "IP Address ต้องเป็นรูปแบบ IPv4 ที่ถูกต้อง" }),
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
		ip?: string[];
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
		zone: "zone-a",
		building: "building-1",
		probe: probeId,
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
			zone: data.zoneId ?? "zone-a",
			building: data.building,
			probe: data.probeId,
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
