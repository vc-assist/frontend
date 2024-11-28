import { BooleanOption, Panel, StaggeredList } from "@vcassist/ui";
import { useAtom } from "jotai";
import { twMerge } from "tailwind-merge";
import { settings } from "./stores";

export function SettingsPanel(props: {
	className?: string;
}) {
	const [hideGPA, setHideGPA] = useAtom(settings.dashboard.hideGPA);
	const [hideGrades, setHideGrades] = useAtom(settings.dashboard.hideGrades);
	const [disableGradeVisualizers, setDisableGradeVisualizers] = useAtom(
		settings.dashboard.disableGradeVisualizers,
	);

	return (
		<Panel
			className={twMerge(
				props.className,
				"flex flex-col gap-2 overflow-y-auto",
			)}
		>
			<StaggeredList title="Dashboard Options" stagger={0.05} expandedByDefault>
				<BooleanOption
					key="hide-gpa"
					title="Hide GPA"
					description="Hide the GPA widget on the dashboard."
					checked={hideGPA}
					onChange={(value) => {
						setHideGPA(!value);
					}}
				/>
				<BooleanOption
					key="hide-grades"
					title="Hide Grades"
					description="Hide the grades widget on the dashboard."
					checked={hideGrades}
					onChange={(value) => {
						setHideGrades(!value);
					}}
				/>
				<BooleanOption
					key="disable-grade-viz"
					title="Disable Grade Warnings"
					description="Disable the coloring of grades as well as the progress circle shown next to the grades on the dashboard."
					checked={disableGradeVisualizers}
					onChange={(value) => {
						setDisableGradeVisualizers(!value);
					}}
				/>
			</StaggeredList>
		</Panel>
	);
}
