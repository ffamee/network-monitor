import { Layers, Minimize2, Eye, EyeOff } from "lucide-react";

interface PanelControlProps {
	// zone: string[];
	toggleOpenPanel: () => void;
	visible: { [key: string]: { polygon: boolean; pin: boolean } };
	setVisible: (zone: string, type: "polygon" | "pin") => void;
	setAllVisible: (type: "polygon" | "pin", value: boolean) => void;
}

export default function PanelControl(prop: PanelControlProps) {
	const allState = {
		polygon: Object.values(prop.visible).every((v) => v.polygon),
		pin: Object.values(prop.visible).every((v) => v.pin),
	};

	return (
		<div className="bg-card text-card-foreground border border-ring rounded-2xl shadow-lg overflow-hidden max-w-xs">
			{/* Panel Header */}
			<div className="flex items-center justify-between p-3 border-b border-ring">
				<div className="flex items-center gap-2">
					<Layers size={18} className="text-primary" />
					<span className="font-semibold text-sm ">Map Layers</span>
				</div>
				<button
					onClick={prop.toggleOpenPanel}
					className="p-1.5 text-secondary-foreground/30 hover:text-primary hover:scale-110 transition-all"
				>
					<Minimize2 size={16} />
				</button>
			</div>
			{/* Panel Content */}
			<div className="p-4 space-y-6 animate-in fade-in duration-300">
				{/* Zones Section */}
				<div className="space-y-4">
					<div className="text-xs font-semibold text-secondary-foreground/30 uppercase tracking-wider flex items-center justify-between">
						Zones
						<span className="text-[10px] bg-secondary-foreground/30 px-1.5 py-0.5 rounded text-card">
							{Object.keys(prop.visible).length}
						</span>
					</div>
					<div className="space-y-4 max-h-60 overflow-y-auto">
						{Object.keys(prop.visible).map((z) => (
							<div key={z} className="space-y-2 px-4">
								<h5 className="text-sm font-medium">{z}</h5>
								<div className="flex flex-row gap-4">
									<div
										data-on={prop.visible[z]?.polygon ? "true" : "false"}
										className="inline-flex items-center gap-2 text-sm cursor-pointer group"
										onClick={() => prop.setVisible(z, "polygon")}
									>
										<Eye
											size={16}
											className="text-primary group-data-[on=true]:block group-data-[on=false]:hidden"
										/>
										<EyeOff
											size={16}
											className="text-secondary-foreground/30 hover:text-primary transition-colors
																group-data-[on=true]:hidden group-data-[on=false]:block"
										/>
										Polygon
									</div>
									<div
										data-on={prop.visible[z]?.pin ? "true" : "false"}
										className="inline-flex items-center gap-2 text-sm cursor-pointer group"
										onClick={() => prop.setVisible(z, "pin")}
									>
										<Eye
											size={16}
											className="text-primary group-data-[on=true]:block group-data-[on=false]:hidden"
										/>
										<EyeOff
											size={16}
											className="text-secondary-foreground/30 hover:text-primary transition-colors
																group-data-[on=true]:hidden group-data-[on=false]:block"
										/>
										Show Pin
									</div>
								</div>
							</div>
						))}
					</div>
					<div
						key="all"
						className="text-xs border-t border-ring pt-2 space-y-2"
					>
						<div className="font-medium">Show All(s)</div>
						<div className="grid grid-cols-2 gap-4 w-full">
							<div
								data-on={allState.polygon ? "true" : "false"}
								className="inline-flex text-left items-center gap-2 cursor-pointer group hover:text-primary transition-colors hover:underline"
								onClick={() => prop.setAllVisible("polygon", !allState.polygon)}
							>
								<Eye
									size={16}
									className="text-primary group-hover:text-secondary-foreground/30 transition-colors
															group-data-[on=true]:block group-data-[on=false]:hidden"
								/>
								<EyeOff
									size={16}
									className="text-secondary-foreground/30 group-hover:text-primary transition-colors
															group-data-[on=true]:hidden group-data-[on=false]:block"
								/>
								Polygon(s)
							</div>
							<div
								data-on={allState.pin ? "true" : "false"}
								className="inline-flex text-left items-center gap-2 cursor-pointer group hover:text-primary transition-colors hover:underline"
								onClick={() => prop.setAllVisible("pin", !allState.pin)}
							>
								<Eye
									size={16}
									className="text-primary group-hover:text-secondary-foreground/30 transition-colors
															group-data-[on=true]:block group-data-[on=false]:hidden"
								/>
								<EyeOff
									size={16}
									className="text-secondary-foreground/30 group-hover:text-primary transition-colors
															group-data-[on=true]:hidden group-data-[on=false]:block"
								/>
								Show Pin(s)
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
