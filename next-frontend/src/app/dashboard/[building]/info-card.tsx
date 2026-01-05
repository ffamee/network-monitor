import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

interface BuildingInfoCardProps {
	floorCount?: number;
	totalProbes: number;
	contact: string;
}

export const InfoCard = (props: BuildingInfoCardProps) => {
	return (
		<Card className="ring-foreground/20 shadow-md h-auto rounded-4xl">
			<CardHeader>
				<CardTitle>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary rounded-xl text-primary-foreground">
							<Server size={20} />
						</div>
						<div className="text-card-foreground font-semibold text-lg">
							ข้อมูลอาคาร
						</div>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="h-full">
				<div className="grid grid-cols-2 gap-4 h-full content-center items-center">
					<div className="bg-secondary p-3 rounded-2xl border border-ring hover:border-primary/75 hover:border-2 transition-colors">
						<label className="text-xs text-card-foreground/75 mb-1">
							จำนวนชั้นทั้งหมด
						</label>
						<div className="text-2xl font-bold text-secondary-foreground/75">
							{props.floorCount ?? "-"}{" "}
							<span className="text-sm font-normal text-card-foreground/75">
								ชั้น
							</span>
						</div>
					</div>
					<div className="bg-secondary p-3 rounded-2xl border border-ring hover:border-primary/75 hover:border-2 transition-colors">
						<label className="text-xs text-card-foreground/75 mb-1">
							อุปกรณ์ทั้งหมด
						</label>
						<div className="text-2xl font-bold text-primary/75">
							{props.totalProbes}{" "}
							<span className="text-sm font-normal text-card-foreground/75">
								ตัว
							</span>
						</div>
					</div>
					<div className="col-span-2 flex flex-col gap-1 h-auto">
						<label className="text-xs text-card-foreground/75 mb-1">
							ผู้ดูแลระบบ
						</label>
						<div className="flex items-center gap-2 text-sm text-black dark:text-white bg-secondary-foreground/20 p-2 rounded-lg">
							<div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
							{props.contact}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
