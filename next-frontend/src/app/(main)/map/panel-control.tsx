import { Layers, Minimize2 } from "lucide-react";

interface PanelControlProps {
	// zone: string[];
	toggleOpenPanel: () => void;
	visible: { [key: string]: { polygon: boolean; pin: boolean } };
	setVisible: (zone: string, type: "polygon" | "pin") => void;
	setAllVisible: (type: "polygon" | "pin") => void;
}

export default function PanelControl(prop: PanelControlProps) {
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
					<div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
						{Object.keys(prop.visible).map((z) => (
							<div key={z} className="space-y-2 px-4">
								<h5 className="text-sm font-medium">{z}</h5>
								<div className="flex flex-row gap-4">
									<label className="inline-flex items-center gap-2 text-sm cursor-pointer">
										<input
											type="checkbox"
											checked={prop.visible[z]?.polygon || false}
											onChange={() => prop.setVisible(z, "polygon")}
											className="accent-primary"
										/>
										Show Polygon
									</label>
									<label className="inline-flex items-center gap-2 text-sm cursor-pointer">
										<input
											type="checkbox"
											checked={prop.visible[z]?.pin || false}
											onChange={() => prop.setVisible(z, "pin")}
											className="accent-primary"
										/>
										Show Pin
									</label>
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
							<label className="inline-flex text-left items-center gap-2 cursor-pointer">
								<button
									onClick={() => prop.setAllVisible("polygon")}
									className="accent-primary hover:underline hover:text-primary"
								>
									Polygon(s)
								</button>
							</label>
							<label className="inline-flex text-left items-center gap-2 cursor-pointer">
								<button
									onClick={() => prop.setAllVisible("pin")}
									className="accent-primary hover:underline hover:text-primary"
								>
									Pin(s)
								</button>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
