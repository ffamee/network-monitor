import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export const UpTimeCard = async () => {
	await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async data fetching
	return (
		<Card className="ring-foreground/20 shadow-md h-full lg:h-auto rounded-4xl">
			<CardContent className="h-full">
				<div className="flex flex-col h-full justify-between">
					<div className="flex justify-between items-center">
						<div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
							<ShieldCheck size={20} />
						</div>
						<span className="text-[clamp(0.75rem,0.7vw,1rem)] text-emerald-500 dark:text-emerald-400 font-medium">
							+2.4%
						</span>
					</div>
					<div className="lg:pb-4">
						<label className="text-card-foreground/75 text-sm">
							Uptime เฉลี่ย
						</label>
						<p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
							99.8%
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
