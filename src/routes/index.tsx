import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Dashboard,
});

import { dateFromUnix } from "@/src/lib/date";
import { settings } from "@/src/lib/stores";
import type { Data } from "@backend.sis/api_pb";
import { ErrorPage, WidgetHiddenPanel, createDefaultMeter } from "@vcassist/ui";
import { useEffect } from "react";
import DayBlock from "@/src/lib/DayBlock";
import Gpa from "@/src/lib/Gpa";
import GradeList from "@/src/lib/GradeList";
import Schedule from "@/src/lib/Schedule";
import { useAtomValue } from "jotai";
import { DataModulesAtom } from "../lib/stores";
import { useQuery } from "@tanstack/react-query";
import { LoadingPage } from "../lib/LoadingPage";

const meter = createDefaultMeter("routes.dashboard");
const viewPage = meter.createCounter("view");

function Dashboard() {
	const dataModules = useAtomValue(DataModulesAtom);
	useEffect(() => {
		viewPage.add(1);
	}, []);
	const hideGPA = useAtomValue(settings.dashboard.hideGPA);
	const hideGrades = useAtomValue(settings.dashboard.hideGrades);
	const disableGradeVisualizers = useAtomValue(
		settings.dashboard.disableGradeVisualizers,
	);

	if (!dataModules?.powerschool) return;
	const powerschoolQuery = useQuery({
		queryKey: ["moodle"],
		queryFn: dataModules.powerschool.get,
	});
	if (powerschoolQuery.isLoading) return <LoadingPage />;
	if (powerschoolQuery.isError) return <ErrorPage />;

	const data = powerschoolQuery.data!;

	const daySet = new Set<string>();
	for (const course of data.courses) {
		daySet.add(course.dayName);
	}
	const dayNames = Array.from(daySet);

	const now = new Date();
	let currentDay = "";
	courses: for (const course of data.courses) {
		// console.log("ASD", course);
		for (const meeting of course.meetings) {
			const startDate = dateFromUnix(meeting.start);
			if (
				startDate.getFullYear() === now.getFullYear() &&
				startDate.getMonth() === now.getMonth() &&
				startDate.getDate() === now.getDate()
			) {
				currentDay = course.dayName;
				break courses;
			}
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="flex flex-col gap-6">
				{/* grid is used here so I don't have to deal with
        flexbox flex shenanigans */}
				<div className="grid grid-cols-2 gap-6">
					<DayBlock dayNames={dayNames} currentDay={currentDay} />
					{!hideGPA ? (
						<Gpa gpa={data.profile?.currentGpa ?? -1} />
					) : (
						<WidgetHiddenPanel message="GPA is hidden" />
					)}
				</div>
				<Schedule
					className="overflow-visible"
					dayNames={dayNames}
					courses={data.courses}
				/>
			</div>

			{!hideGrades ? (
				<GradeList
					className="w-full"
					dayNames={dayNames}
					courses={data.courses}
					plain={disableGradeVisualizers}
				/>
			) : (
				<WidgetHiddenPanel
					className="max-h-[500px] min-h-[300px]"
					message="Grade List is hidden"
				/>
			)}
		</div>
	);
}
