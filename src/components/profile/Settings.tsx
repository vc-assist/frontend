import { BooleanOption, Panel, StaggeredList } from "@vcassist/ui"
import { twMerge } from "tailwind-merge"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const settings = {
  dashboard: {
    hideGPA: create<{ on: boolean }>()(
      persist(() => ({ on: false as boolean }), { name: "settings.dashboard-hide-gpa" }),
    ),
    hideGrades: create<{ on: boolean }>()(
      persist(() => ({ on: false as boolean }), { name: "settings.dashboard-hide-grades" }),
    ),
    disableGradeVisualizers: create<{ on: boolean }>()(
      persist(() => ({ on: false as boolean }), {
        name: "settings.dashboard-disable-grade-visualizers",
      }),
    ),
  },
}

export function SettingsPanel(props: {
  className?: string
}) {
  const hideGPA = settings.dashboard.hideGPA((s) => s.on)
  const hideGrades = settings.dashboard.hideGrades((s) => s.on)
  const disableGradeVisualizers = settings.dashboard.disableGradeVisualizers((s) => s.on)

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
            settings.dashboard.hideGPA.setState({ on: !value })
          }}
        />
        <BooleanOption
          key="hide-grades"
          title="Hide Grades"
          description="Hide the grades widget on the dashboard."
          checked={hideGrades}
          onChange={(value) => {
            settings.dashboard.hideGrades.setState({ on: !value })
          }}
        />
        <BooleanOption
          key="disable-grade-viz"
          title="Disable Grade Warnings"
          description="Disable the coloring of grades as well as the progress circle shown next to the grades on the dashboard."
          checked={disableGradeVisualizers}
          onChange={(value) => {
            settings.dashboard.disableGradeVisualizers.setState({ on: !value })
          }}
        />
      </StaggeredList>
    </Panel>
  )
}
