"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { HardDrive, Server, Video, Wifi, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface BuildingStatusCarouselProps {
	data: {
		label: string;
		percent: number;
		status: string;
		icon: string;
		color: string;
		bg: string;
	}[];
}

const iconMap: { [key: string]: React.ReactNode } = {
	server: <Server />,
	wifi: <Wifi />,
	"hard-drive": <HardDrive />,
	zap: <Zap />,
	video: <Video />,
};

/**
 * BuildingStatusCarousel Component
 * Displays a carousel of building status metrics.
 *
 * @deprecated This component is currently not in use.
 */

export function BuildingStatusCarousel(props: BuildingStatusCarouselProps) {
	const plugins = useRef(
		Autoplay({ delay: 3000, stopOnMouseEnter: true, stopOnInteraction: false }),
	);
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) return;
		setCount(api.scrollSnapList().length);
		api.on("select", () => {
			setCurrentIndex(api.selectedScrollSnap());
		});
	}, [api]);

	const handleChangeIndex = (idx: number) => {
		if (!api) return;
		api.scrollTo(idx);
	};

	return (
		<Carousel
			setApi={setApi}
			className="w-full h-full relative rounded-4xl"
			plugins={[plugins.current]}
			opts={{
				loop: true,
			}}
		>
			<div className="*:h-full h-full *:rounded-4xl">
				<CarouselContent className="h-full">
					{props.data.map((metric, index) => (
						<CarouselItem key={index} className="h-full *:h-full">
							<Card>
								<CardContent className="h-full flex flex-col justify-between pb-8">
									<div className="flex justify-between items-center">
										<div
											className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}
										>
											{iconMap[metric.icon]}
										</div>
										<span
											className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
												metric.percent > 90
													? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
													: metric.percent > 70
														? "bg-blue-500/10 text-blue-500 border-blue-500/20"
														: "bg-amber-500/10 text-amber-500 border-amber-500/20"
											}`}
										>
											{metric.status}
										</span>
									</div>
									<div>
										<div className="mt-2">
											<p className="text-card-foreground/75 text-sm mb-1">
												{metric.label}
											</p>
											<div className="flex items-baseline gap-2">
												<p className={`text-3xl font-bold ${metric.color}`}>
													{metric.percent}%
												</p>
												<span className="text-xs text-card-foreground/50">
													health
												</span>
											</div>
										</div>
										<div className="h-1.5 w-full bg-secondary-foreground/30 rounded-full mt-2 overflow-hidden">
											<div
												className={`h-full rounded-full ${
													metric.percent > 90
														? "bg-emerald-500"
														: metric.percent > 70
															? "bg-blue-500"
															: "bg-amber-500"
												}`}
												style={{ width: `${metric.percent}%` }}
											></div>
										</div>
									</div>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
				</CarouselContent>
			</div>
			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
				{Array.from({ length: count }).map((_, idx) => (
					<div
						key={idx}
						onClick={handleChangeIndex.bind(null, idx)}
						className={`h-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
							idx === currentIndex
								? "w-6 bg-black dark:bg-white"
								: "w-1 bg-black/40 dark:bg-white/40 cursor-pointer"
						}`}
					/>
				))}
			</div>
		</Carousel>
	);
}
