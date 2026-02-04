// "use client";

// export default function EditPage() {
// 	return <EditUserForm user={{ id: "1", email: "john@example.com" }} />;
// }

// import { useActionState } from "react";
// import { updateUser } from "@/actions/user-edit-action"; // import server action

// export function EditUserForm({
// 	user,
// }: {
// 	user: { id: string; name?: string; email?: string };
// }) {
// 	// ⭐️ KEY POINT: สร้าง version ของ action ที่มี id ฝังอยู่แล้ว
// 	// null ตัวแรกคือ context (this) ซึ่งใน server action เราไม่ใช้
// 	const updateUserWithId = updateUser.bind(null, user.id);

// 	// ส่ง bound action เข้าไปใน hook
// 	const [state, formAction, isPending] = useActionState(updateUserWithId, null);

// 	return (
// 		<form action={formAction} className="space-y-4 p-4 border rounded-lg">
// 			{/* Name Input */}
// 			<div>
// 				<label htmlFor="name" className="block text-sm font-medium">
// 					Name
// 				</label>
// 				<input
// 					id="name"
// 					name="name"
// 					placeholder="enter name"
// 					defaultValue={user.name}
// 					className="border p-2 w-full rounded"
// 					aria-describedby="name-error"
// 				/>
// 				{/* Error Message */}
// 				{state?.errors?.name && (
// 					<p id="name-error" className="text-red-500 text-sm mt-1">
// 						{state.errors.name.join(", ")}
// 					</p>
// 				)}
// 			</div>

// 			{/* Email Input */}
// 			<div>
// 				<label htmlFor="email" className="block text-sm font-medium">
// 					Email
// 				</label>
// 				<input
// 					id="email"
// 					name="email"
// 					placeholder="enter email e.g. john@example.com"
// 					defaultValue={user.email}
// 					className="border p-2 w-full rounded"
// 				/>
// 				{state?.errors?.email && (
// 					<p className="text-red-500 text-sm mt-1">
// 						{state.errors.email.join(", ")}
// 					</p>
// 				)}
// 			</div>

// 			{/* Global Error Message */}
// 			{state?.message && (
// 				<p className="text-red-500 font-bold">{state.message}</p>
// 			)}

// 			{/* Submit Button */}
// 			<button
// 				type="submit"
// 				disabled={isPending}
// 				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
// 			>
// 				{isPending ? "Updating..." : "Save Changes"}
// 			</button>
// 		</form>
// 	);
// }

export default function EditPage() {
	return null;
}
