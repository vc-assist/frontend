import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { persistentSignal, StaggeredList, Panel, BooleanOption } from '@vcassist/ui'

export const settings = {
  dashboard: {
    hideGPA: persistentSignal({
      key: "dashboard-hide-gpa",
      defaultValue: false,
      schema: z.boolean(),
    }),
    hideGrades: persistentSignal({
      key: "dashboard-hide-grades",
      defaultValue: false,
      schema: z.boolean(),
    }),
    disableGradeVisualizers: persistentSignal({
      key: "dashboard-disable-grade-visualizers",
      defaultValue: false,
      schema: z.boolean(),
    }),
  },
};

export function SettingsPanel(props: {
  className?: string;
}) {
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
          signal={settings.dashboard.hideGPA}
        />
        <BooleanOption
          key="hide-grades"
          title="Hide Grades"
          description="Hide the grades widget on the dashboard."
          signal={settings.dashboard.hideGrades}
        />
        <BooleanOption
          key="disable-grade-viz"
          title="Disable Grade Visualizers"
          description="Disable the progress circle shown next to the grades on the dashboard."
          signal={settings.dashboard.disableGradeVisualizers}
        />
      </StaggeredList>
    </Panel>
  );
}
