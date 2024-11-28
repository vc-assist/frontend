import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/grade-calculator")({
	component: GradeCalculator,
});

// export * from "./logic"
// export * from "./WhatIf"
// export * from "./NecessaryScore"

import type { CourseData } from "@backend.sis/data_pb";
import { Code, Select, Text, Title } from "@mantine/core";
import { Tabs } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ErrorPage, LinkButton, Panel, useLayout, useSpan } from "@vcassist/ui";
import { useState } from "react";
import { MdInfo, MdSportsScore, MdTimeline } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import NecessaryScore from "@/src/lib/components/NecessaryScore";
import { WhatIfInterface } from "@/src/lib/components/WhatIf";
import { fnSpan } from "@/src/lib/internal";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { DataModulesAtom } from "../lib/stores";
import { LoadingPage } from "../lib/components/LoadingPage";
import { useQuery } from "@tanstack/react-query";

enum CalcTab {
	WHAT_IF = "what-if",
	CALC_SCORE = "calc-score",
	INFO = "info",
}

function GradeCalculator() {
	const span = useSpan(fnSpan, undefined, "calculator");

	const layout = useLayout();
	const [activeTab, setActiveTab] = useState<CalcTab | null>(CalcTab.WHAT_IF);

	const courseForm = useForm<
		Partial<{
			course: string;
		}>
	>({
		validate: {
			course: (c) => (c !== undefined ? null : "You must select a course."),
		},
	});
	const dataModules = useAtomValue(DataModulesAtom);
	if (!dataModules?.powerschool) return;
	const powerschoolQuery = useQuery({
		queryKey: ["powerschool"],
		queryFn: dataModules.powerschool.get,
	});

	const courses = useMemo(() => {
		if (!powerschoolQuery.data) return [];
		return powerschoolQuery.data.courses;
	}, [powerschoolQuery.data]);

	const course = courseForm.values.course
		? courses.find((v) => v.name === courseForm.values.course)
		: undefined;

	const courseAssignmentTypes = useMemo(() => {
		if (!course) {
			return;
		}
		return course.assignmentCategories.map((t) => ({
			name: t.name,
			courseName: course.name,
			weight: t.weight,
		}));
	}, [course]);

	if (powerschoolQuery.isLoading) return <LoadingPage />;
	if (powerschoolQuery.isError) return <ErrorPage />;

	return (
		<div
			className={twMerge(
				"grid gap-6",
				layout === "mobile" ? "grid-cols-1" : "grid-cols-2",
			)}
		>
			<div className="flex flex-col gap-6">
				<Panel className="flex flex-col gap-3">
					<Title order={4}>Course</Title>
					<Select
						placeholder="Select a course"
						data={courses.map((c) => {
							return {
								value: c.name,
								label: c.name,
							};
						})}
						searchable
						{...courseForm.getInputProps("course")}
					/>
				</Panel>

				<Panel className="flex flex-col gap-3 flex-1">
					<Tabs
						classNames={{ root: "flex flex-col gap-3" }}
						keepMounted={false}
						value={activeTab}
						onChange={(tab) => {
							setActiveTab(tab as CalcTab | null);
						}}
					>
						<Tabs.List>
							<Tabs.Tab
								value={CalcTab.WHAT_IF}
								leftSection={<MdTimeline size={20} />}
							>
								Possible Grade
							</Tabs.Tab>
							<Tabs.Tab
								value={CalcTab.CALC_SCORE}
								leftSection={<MdSportsScore size={20} />}
							>
								Necessary Score
							</Tabs.Tab>
							<Tabs.Tab value={CalcTab.INFO} leftSection={<MdInfo size={18} />}>
								Information
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value={CalcTab.WHAT_IF}>
							<div className="flex flex-col gap-2 font-normal leading-5 select-text">
								<Text>
									What if your teacher finally graded that one test from last
									unit? What would happen if you got a perfect score on your
									final? You can use the "What if" calculator to see what could
									possibly happen.
								</Text>

								<Text>
									You can edit an existing assignment by clicking on the{" "}
									<i>pencil icon in the far right of the table</i>. If you want
									to add another assignment, you can{" "}
									<i>
										click the "+ Assignment" on the right side of the horizontal
										bar
									</i>
									. If you want to toggle the effects of an assignment you can
									<i>click the eyeball icon in the far right of the table</i>.
								</Text>
							</div>
						</Tabs.Panel>

						<Tabs.Panel value={CalcTab.CALC_SCORE}>
							<div className="flex flex-col gap-3 leading-5 font-normal select-text">
								<Text>
									Ever wondered how well you need to do on a test to get a
									certain grade? With the Necessary Score calculator you can now
									get a definitive answer.
								</Text>
								<Text>
									<b className="font-semibold">
										First, choose the category the assignment is in
									</b>{" "}
									by clicking on one of the categories labeled{" "}
									<Code className="text-md">category | grade%</Code>. The grade
									next to a given category is the grade you likely have in that
									category.
								</Text>
								<Text>
									<b className="font-semibold">
										Second, choose the grade you want
									</b>{" "}
									by using the slider or the textbox next to it. (Do note that
									achieving 100% if your current grade is less than 100% is
									impossible unless you have extra credit.)
								</Text>
								<Text>
									<b className="font-semibold">
										Lastly, input the number of points the test, project or
										assignment is worth
									</b>{" "}
									into the "Total Points" textbox and hit calculate!.
								</Text>
							</div>
						</Tabs.Panel>

						<Tabs.Panel value={CalcTab.INFO}>
							<div className="flex flex-col gap-3 select-text">
								<Title order={4}>What is this?</Title>
								<Text className="font-normal">
									This is VC Assist's grade calculator. We have two modes,
									depending on what you want to calculate. The accuracy of these
									calulations depend on how accurate these weights are. If you
									have any questions, or would like to report an incorrect
									result or weight, please contact us at{" "}
									<LinkButton
										onClick={() => {
											window.open("mailto:hello@vcassist.org");
										}}
									>
										hello@vcassist.org
									</LinkButton>
									.
								</Text>
							</div>
						</Tabs.Panel>
					</Tabs>
				</Panel>
			</div>

			{course && courseAssignmentTypes && activeTab === CalcTab.WHAT_IF ? (
				<WhatIfInterface
					parentSpan={span}
					course={course}
					assignmentTypes={courseAssignmentTypes}
				/>
			) : undefined}

			{activeTab === CalcTab.CALC_SCORE ? (
				<NecessaryScore course={course} parentSpan={span} />
			) : undefined}
		</div>
	);
}
