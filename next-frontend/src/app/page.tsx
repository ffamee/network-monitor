import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
	return (
		<div className="min-h-full h-dvh w-full overflow-y-auto overscroll-none no-scrollbar">
			<div className="h-full bg-background relative overflow-hidden flex flex-col items-center justify-center">
				{/* Background Elements */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:bg-blend-overlay">
					<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/50 rounded-full blur-[120px]"></div>
				</div>

				<div className="z-10 text-center px-4 max-w-4xl mx-auto">
					<div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
						<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
						Live System Monitoring v2.0
					</div>

					<h1 className="text-5xl md:text-7xl font-bold text-accent-foreground mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
						Probe
						<span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-destructive/70">
							Mon
						</span>
					</h1>

					<p className="text-ring text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
						ระบบตรวจสอบสถานะเครือข่ายและอุปกรณ์ภายในอาคารแบบ Real-time
						ด้วยหน้าจอ Dashboard อัจฉริยะที่ช่วยให้คุณไม่พลาดทุกเหตุการณ์สำคัญ
					</p>

					<Link
						// onClick={onStart}
						href={"/dashboard"}
						className="group relative px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_15px_var(--destructive)]/50 hover:shadow-[0_0_30px_var(--destructive)]/50 flex items-center gap-2 mx-auto animate-in fade-in zoom-in duration-300 delay-75 hover:scale-105"
					>
						เข้าสู่ระบบ Dashboard
						<ArrowRight className="group-hover:translate-x-1 transition-transform" />
					</Link>
				</div>

				<div className="absolute bottom-6 text-accent-foreground text-xs text-center w-full">
					© 2024 NetGuardian System. All rights reserved.
				</div>
			</div>
		</div>
	);
}
