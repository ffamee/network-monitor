import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const AlertCard = async () => {
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async data fetching
	return (
		<Card className="ring-foreground/20 shadow-md h-full lg:h-auto rounded-4xl">
			<CardContent className="h-full">
				<div className="flex flex-col h-full justify-between">
					<div className="flex justify-between items-center">
						<div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
							<AlertCircle size={20} />
						</div>
						<span className="text-[clamp(0.75rem,0.7vw,1rem)] text-rose-600 dark:text-rose-500 font-medium">
							Critical
						</span>
					</div>
					<div className="lg:pb-4">
						<p className="text-card-foreground/75 text-sm">แจ้งเตือนวันนี้</p>
						<p className="text-3xl font-bold text-rose-600 dark:text-rose-500">
							3
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
