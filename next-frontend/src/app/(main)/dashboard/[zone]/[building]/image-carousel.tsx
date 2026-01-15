"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface BuildingCarouselProps {
	images: string[];
	name: string;
	address: string;
}

export function BuildingImageCarousel(props: BuildingCarouselProps) {
	const plugins = useRef(
		Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false })
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

	if (!props.images || props.images.length === 0) {
		return (
			<div className="w-full h-full min-w-xs lg:min-w-md bg-accent rounded-2xl flex items-center justify-center">
				{"No images available."}
			</div>
		);
	}

	return (
		<Carousel
			setApi={setApi}
			className="group w-full h-full relative"
			plugins={[plugins.current]}
			opts={{
				loop: true,
			}}
			data-testid="building-image-carousel"
		>
			<div className="*:h-full h-full">
				<CarouselContent className="h-full">
					{props.images.map((img, index) => (
						<CarouselItem key={index}>
							<Card className="bg-stone-900 rounded-4xl w-full h-full max-h-full">
								<CardContent className="flex aspect-square items-center justify-center">
									<Image
										loading="eager"
										src={img}
										alt={`Slide ${index}`}
										width={500}
										height={500}
										className="w-full h-full object-cover rounded-lg mask-b-from-50% text-white"
									/>
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
						className={`h-1 md:h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
							idx === currentIndex
								? "w-6 md:w-8 bg-white"
								: "w-1 md:w-2 bg-white/40 cursor-pointer"
						}`}
					/>
				))}
			</div>
			<div className="absolute bottom-6 left-0 p-6 z-20 w-full select-auto">
				<div className="text-[clamp(1rem,2vw,1.5rem)] font-bold text-white mb-1 drop-shadow-xl line-clamp-2">
					{props.name}
				</div>
				<div className="flex items-center gap-2 text-slate-200 text-sm drop-shadow-lg">
					<MapPin size={14} />
					<div className="w-full truncate">{props.address}</div>
				</div>
			</div>
			<CarouselPrevious
				hidden={count <= 1}
				className="bg-foreground/20 text-accent-foreground z-20 md:top-auto md:bottom-9 md:left-auto md:right-1/12 md:-translate-x-2/3 lg:right-1/6 lg:-translate-x-full border-slate-200/50 md:text-white/50 cursor-pointer transform hover:scale-125 transition-all duration-150 delay-75 md:opacity-0 group-hover:opacity-100"
				data-testid="building-image-carousel-previous"
			/>
			<CarouselNext
				hidden={count <= 1}
				className="bg-foreground/20 text-accent-foreground z-20 md:top-auto md:bottom-9 md:left-auto md:right-1/12 md:translate-x-2/3 lg:right-1/6 lg:translate-x-full border-slate-200/50 md:text-white/50 cursor-pointer transform hover:scale-125 transition-all duration-150 delay-75 md:opacity-0 group-hover:opacity-100"
				data-testid="building-image-carousel-next"
			/>
		</Carousel>
	);
}
