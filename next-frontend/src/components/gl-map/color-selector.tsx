"use client";

interface ColorPickerProps {
	color: string; // รับค่าสีปัจจุบัน (Hex)
	onChange: (hex: string) => void; // ส่งค่าสีใหม่กลับไป (Hex)
}

export default function ColorPickerAdvanced({
	color,
	onChange,
}: ColorPickerProps) {
	// แปลง Hex เป็น Object เพื่อเอามาโชว์ใน Input
	const { r, g, b } = hexToRgbObj(color);

	// ฟังก์ชันเมื่อมีการแก้ตัวเลขในช่อง R, G หรือ B
	const handleRgbChange = (channel: "r" | "g" | "b", value: string) => {
		let val = parseInt(value);
		if (isNaN(val)) val = 0;

		// สร้างสีใหม่โดยเอาค่าใหม่ผสมกับค่าเดิม
		const newR = channel === "r" ? val : r;
		const newG = channel === "g" ? val : g;
		const newB = channel === "b" ? val : b;

		// แปลงกลับเป็น Hex แล้วส่งไป update state หลัก
		onChange(rgbToHex(newR, newG, newB));
	};

	return (
		<div className="p-3 bg-card rounded-xl shadow-lg border border-right w-fit font-sans">
			<div className="flex gap-4">
				{/* ส่วนที่ 1: กล่องสี (Color Swatch) + Native Picker */}
				<div className="relative w-16 h-auto rounded-lg shadow-inner ring-1 ring-black/5 overflow-hidden shrink-0 group cursor-pointer">
					<div
						className="absolute inset-0 w-full h-full"
						style={{ backgroundColor: color }}
					/>
					{/* Input type="color" ซ่อนอยู่ข้างบน */}
					<input
						type="color"
						value={color}
						onChange={(e) => onChange(e.target.value)}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					{/* Tooltip เล็กๆ เมื่อเอาเมาส์ชี้ */}
					<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
						<span className="text-white text-xs font-bold drop-shadow-md">
							PICK
						</span>
					</div>
				</div>

				{/* ส่วนที่ 2: ช่องกรอกตัวเลข (Inputs) */}
				<div className="flex flex-col gap-2">
					{/* HEX Input (เผื่อ user อยากก๊อปวาง Hex ตรงๆ) */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-bold text-secondary-foreground/70 w-6">
							HEX
						</span>
						<input
							type="text"
							value={color.toUpperCase()}
							onChange={(e) => {
								// อนุญาตให้พิมพ์แก้ Hex ได้ ถ้ารูปแบบถูก
								if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
									onChange(e.target.value);
								}
							}}
							className="w-full text-xs font-mono border border-ring rounded px-2 py-1 focus:outline-none focus:border-primary uppercase"
						/>
					</div>

					{/* RGB Inputs */}
					<div className="flex gap-2 w-full justify-end-safe">
						<RgbInput
							label="R"
							value={r}
							onChange={(v) => handleRgbChange("r", v)}
						/>
						<RgbInput
							label="G"
							value={g}
							onChange={(v) => handleRgbChange("g", v)}
						/>
						<RgbInput
							label="B"
							value={b}
							onChange={(v) => handleRgbChange("b", v)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

// Sub-component เล็กๆ สำหรับช่องกรอกแต่ละสี
const RgbInput = ({
	label,
	value,
	onChange,
}: {
	label: string;
	value: number;
	onChange: (val: string) => void;
}) => (
	<div className="flex flex-col items-center gap-0.5">
		<label className="text-[10px] font-bold text-secondary-foreground/70 select-none">
			{label}
		</label>
		<input
			type="number"
			min="0"
			max="255"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-10 text-center text-xs border border-ring rounded py-1 focus:outline-none focus:border-primary focus:border-2 font-mono text-card-foreground appearance-none m-0"
		/>
	</div>
);

// แปลง HEX -> Object {r, g, b}
const hexToRgbObj = (hex: string) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: { r: 0, g: 0, b: 0 };
};

// แปลง R, G, B -> HEX String
const rgbToHex = (r: number, g: number, b: number) => {
	const componentToHex = (c: number) => {
		const hex = Math.max(0, Math.min(255, c)).toString(16); // Clamp 0-255
		return hex.length === 1 ? "0" + hex : hex;
	};
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};
