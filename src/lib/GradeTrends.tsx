import type { CourseData } from "@backend.sis/data_pb";
import { SegmentedControl, Title, UnstyledButton } from "@mantine/core";
import { Panel } from "@vcassist/ui";
import type { ApexOptions } from "apexcharts";
import { AnimatePresence, motion } from "framer-motion";
import { createRef, forwardRef, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { IconType } from "react-icons";
import { MdExpandLess, MdTrendingFlat, MdTrendingUp } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { analyzeGradeChange, generateSeries } from "./grade-trend-utils";

const SmallButton = forwardRef(
	(
		props: {
			icon: IconType;
			className?: string;
			onClick?: () => void;
		},
		ref: React.ForwardedRef<HTMLButtonElement>,
	) => {
		return (
			<UnstyledButton
				className={twMerge(
					"bg-bg-dimmed rounded-full shadow-lg p-1",
					"transition-all hover:scale-110 active:scale-90",
					props.className,
				)}
				onClick={props.onClick}
				ref={ref}
			>
				<props.icon className="w-7 h-7" />
			</UnstyledButton>
		);
	},
);

SmallButton.displayName = "SmallButton";

export enum GradeInterval {
	ALL = "all",
	MONTH = "month",
	WEEK = "week",
}

export default function Grades(props: {
	courses: CourseData[];
	interval?: GradeInterval;
}) {
	const [showOptions, setShowOptions] = useState(false);
	const [flatTrends, setFlatTrends] = useState(true);
	const [interval, setInterval] = useState<GradeInterval>(
		props.interval ?? GradeInterval.MONTH,
	);

	const analysis = useMemo(
		() => analyzeGradeChange(props.courses),
		[props.courses],
	);

	const series = useMemo(
		() =>
			generateSeries(analysis, {
				onlyChanged: !flatTrends,
				fromLast:
					interval === GradeInterval.ALL
						? undefined
						: {
								months: interval === GradeInterval.MONTH ? 1 : undefined,
								weeks: interval === GradeInterval.WEEK ? 1 : undefined,
							},
			}),
		[analysis, flatTrends, interval],
	);

	const empty = useMemo(() => {
		for (const s of series.series) {
			if (s.data.length > 0) {
				return false;
			}
		}
		return true;
	}, [series]);

	const colorStops: {
		offset: number;
		color: string;
		opacity: number;
	}[][] = useMemo(() => {
		const stops = [];
		for (const s of series.series) {
			stops.push([
				{
					offset: 0,
					color: s.color,
					opacity: 0.3,
				},
				{
					offset: 50,
					color: s.color,
					opacity: 0.15,
				},
				{
					offset: 90,
					color: s.color,
					opacity: 0,
				},
			]);
		}
		return stops;
	}, [series.series]);

	const options = useMemo<ApexOptions>(
		() => ({
			fill: {
				type: "gradient",
				gradient: { colorStops },
			},
			responsive: [
				{
					breakpoint: 600,
					options: {
						innerHeight: 800,
						outerHeight: 800,
					},
				},
			],
			dataLabels: { enabled: false },
			stroke: { curve: "smooth" },
			xaxis: {
				type: "category",
				labels: { style: { colors: "var(--primary)" } },
				categories: series.xaxis,
			},
			yaxis: {
				decimalsInFloat: 2,
				forceNiceScale: true,
				min: series.range.min,
				max: series.range.max,
				labels: { style: { colors: "var(--primary)" } },
			},
			legend: { labels: { colors: "var(--primary)" } },
		}),
		[series.range, series.xaxis, colorStops],
	);

	const chartRef = createRef<Chart>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: refs do not need to be tracked
	useEffect(() => {
		if (!chartRef.current) {
			return;
		}
		setTimeout(() => {
			(
				document.querySelector(
					".apexcharts-reset-icon",
				) as HTMLDivElement | null
			)?.click();
		}, 50);
	}, []);

	return (
		<Panel className="relative h-full">
			<Chart
				ref={chartRef}
				className={empty ? "blur-sm" : undefined}
				type="area"
				options={options}
				series={series.series}
				width="100%"
				height="100%"
			/>
			<div className="absolute bottom-4 left-4 flex gap-4">
				<SmallButton
					className={showOptions ? "rotate-90" : ""}
					onClick={() => setShowOptions(!showOptions)}
					icon={MdExpandLess}
				/>
				<AnimatePresence>
					{showOptions ? (
						<motion.div
							className="flex items-center gap-2"
							initial={{ y: "10px", opacity: 0.8 }}
							animate={{ y: "0px", opacity: 1 }}
							exit={{ y: "10px", opacity: 0 }}
						>
							<SmallButton
								icon={flatTrends ? MdTrendingFlat : MdTrendingUp}
								onClick={() => setFlatTrends(!flatTrends)}
							/>
							<SegmentedControl
								className="shadow-lg"
								data={[
									{
										label: "All",
										value: GradeInterval.ALL,
									},
									{
										label: "Month",
										value: GradeInterval.MONTH,
									},
									{
										label: "Week",
										value: GradeInterval.WEEK,
									},
								]}
								defaultValue={interval}
								onChange={(value) => {
									setInterval(value as GradeInterval);
								}}
							/>
						</motion.div>
					) : undefined}
				</AnimatePresence>
			</div>
			{empty ? (
				<Title className="absolute position-center" order={3}>
					No grade data available!
				</Title>
			) : undefined}
		</Panel>
	);
}
