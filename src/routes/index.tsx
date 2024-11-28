import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Dashboard,
});

import { dateFromUnix } from "@/src/lib/date";
import { settings } from "@/src/lib/stores";
import { ErrorPage, WidgetHiddenPanel, createDefaultMeter } from "@vcassist/ui";
import { useEffect } from "react";
import DayBlock from "@/src/lib/components/DayBlock";
import Gpa from "@/src/lib/components/Gpa";
import GradeList from "@/src/lib/components/GradeList";
import Schedule from "@/src/lib/components/Schedule";
import { useAtomValue } from "jotai";
import { LoadingPage } from "@/src/lib/components/LoadingPage";
import { usePowerSchoolQuery } from "../lib/queries";

const meter = createDefaultMeter("routes.dashboard");
const viewPage = meter.createCounter("view");

function Dashboard() {
	useEffect(() => {
		viewPage.add(1);
	}, []);
	const hideGPA = useAtomValue(settings.dashboard.hideGPA);
	const hideGrades = useAtomValue(settings.dashboard.hideGrades);
	const disableGradeVisualizers = useAtomValue(
		settings.dashboard.disableGradeVisualizers,
	);

	const powerschoolQuery = usePowerSchoolQuery()!;
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
