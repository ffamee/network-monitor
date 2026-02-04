"use client";

import { RadialBar, RadialBarChart } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

interface StatChartProps {
	data: {
		mode: "internal" | "external";
		value: number | undefined;
	}[];
	topic: string;
	description: string;
}

const chartConfig = {
	value: {
		label: "Value",
	},
	internal: {
		label: "Internal",
		color: "var(--chart-1)",
	},
	external: {
		label: "External",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function StatChart({ data, description, topic }: StatChartProps) {
	const chartData2 = data.map((d) => ({
		mode: d.mode,
		value: d.value,
		fill: d.mode === "internal" ? "var(--chart-1)" : "var(--chart-2)",
	}));

	return (
		<Card className="flex flex-col border-0">
			<CardHeader className="items-center pb-0">
				<CardTitle>{topic}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-62.5"
				>
					<RadialBarChart
						data={chartData2}
						startAngle={180}
						endAngle={0}
						innerRadius={20}
						outerRadius={50}
					>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									// hideLabel
									labelFormatter={(_label, payload) => (
										<div className="capitalize">{payload[0]?.payload.mode}</div>
									)}
									nameKey="mode"
									formatter={(value) => {
										const numValue =
											typeof value === "number"
												? value
												: parseFloat(String(value));
										return `${numValue.toFixed(2)} ms`;
									}}
								/>
							}
						/>
						<RadialBar dataKey="value" background cornerRadius={3} />
					</RadialBarChart>
				</ChartContainer>
				<CardFooter>
					<div className="text-sm text-muted-foreground text-center">
						{/* {chartData2.map((d) => (
							<span key={d.mode} className="inline-block mx-2">
								{d.mode}: {d.value?.toFixed(2)} ms
							</span>
						))} */}
						<p>Values are in milliseconds (ms)</p>
					</div>
				</CardFooter>
			</CardContent>
		</Card>
	);
}
