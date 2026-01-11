import { Layers, Minimize2, Eye, EyeOff } from "lucide-react";

interface PanelControlProps {
	// zone: string[];
	isOpen: boolean;
	toggleOpenPanel: () => void;
	visible: { [key: string]: { polygon: boolean; pin: boolean } };
	setVisible: (zone: string, type: "polygon" | "pin") => void;
	setAllVisible: (type: "polygon" | "pin", value: boolean) => void;
}

export default function PanelControl(props: PanelControlProps) {
	const allState = {
		polygon: Object.values(props.visible).every((v) => v.polygon),
		pin: Object.values(props.visible).every((v) => v.pin),
	};

	return (
		<div
			data-open={props.isOpen ? "true" : "false"}
			className="fixed mobile:absolute bottom-0 left-0 w-full rounded-t-2xl transition-transform duration-300 ease-out
									mobile:left-auto mobile:bottom-auto mobile:top-20 mobile:right-4 z-50
									bg-card text-card-foreground border border-ring mobile:rounded-2xl shadow-lg overflow-hidden mobile:max-w-[clamp(16rem,30vw,20rem)]
									data-[open=true]:translate-y-0 data-[open=false]:translate-y-full
									mobile:data-[open=true]:block mobile:data-[open=false]:hidden"
		>
			{/* Panel Header */}
			<div className="flex items-center justify-between p-3 border-b border-ring">
				<div className="flex items-center gap-2">
					<Layers size={18} className="text-primary" />
					<span className="font-semibold text-sm ">Map Layers</span>
				</div>
				<button
					onClick={props.toggleOpenPanel}
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
							{Object.keys(props.visible).length}
						</span>
					</div>
					<div className="space-y-4 max-h-60 overflow-y-auto w-full scroll-smooth snap-y snap-mandatory overscroll-none">
						{Object.keys(props.visible).map((z) => (
							<div key={z} className="space-y-2 px-4 snap-start snap-always">
								<h5 className="text-sm font-medium">{z}</h5>
								<div className="grid grid-cols-2 gap-4">
									<div
										data-on={props.visible[z]?.polygon ? "true" : "false"}
										className="inline-flex items-center gap-2 text-sm cursor-pointer group"
										onClick={() => props.setVisible(z, "polygon")}
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
										data-on={props.visible[z]?.pin ? "true" : "false"}
										className="inline-flex items-center gap-2 text-sm cursor-pointer group"
										onClick={() => props.setVisible(z, "pin")}
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
										Pin
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
								onClick={() =>
									props.setAllVisible("polygon", !allState.polygon)
								}
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
								onClick={() => props.setAllVisible("pin", !allState.pin)}
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
