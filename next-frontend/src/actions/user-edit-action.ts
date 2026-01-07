"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Schema สำหรับ Validation
const UserSchema = z.object({
	name: z.string().min(3, { message: "ชื่อต้องยาวกว่า 3 ตัวอักษร" }),
	email: z.email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
});

export type State = {
	errors?: {
		name?: string[];
		email?: string[];
	};
	message?: string | null;
};

// Function Signature: [Arguments from bind], [prevState], [formData]
export async function updateUser(
	userId: string, // รับค่าจาก .bind()
	prevState: State | null, // รับค่าจาก useActionState
	formData: FormData // รับค่าจาก Form Submit
): Promise<State> {
	// 1. Validate Form Data
	const validatedFields = UserSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
	});

	// 2. ถ้า Validate ไม่ผ่าน Return Error กลับไป
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "กรุณาตรวจสอบข้อมูลอีกครั้ง",
		};
	}

	// 3. จำลองการ Update Database
	try {
		console.log(`Updating user ${userId} with data:`, validatedFields.data);
		// await db.user.update({ where: { id: userId }, data: ... })
	} catch (error) {
		return { message: "Database Error: Failed to Update User." };
	}

	// 4. Revalidate & Redirect
	revalidatePath(`/users/${userId}`);
	redirect(`/users/${userId}`);
}
