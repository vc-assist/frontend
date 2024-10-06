import { BooleanOption, Panel, StaggeredList } from "@vcassist/ui"
import { twMerge } from "tailwind-merge"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type SettingsSwitch = {
  on: boolean
  set(value: boolean): void
}

function switchStore(key: string, defaultValue?: boolean) {
  const useStore = create(
    persist<SettingsSwitch>((set) => ({
      on: defaultValue ?? false,
      set(value) {
        set({ on: value })
      }
    }), {
      name: key,
    }),
  )
  return () => useStore(s => s)
}

export const settings = {
  dashboard: {
    useHideGPA: switchStore("settings.dashboard-hide-gpa"),
    useHideGrades: switchStore("settings.dashboard-hide-grades"),
    useDisableGradeVisualizers: switchStore("settings.dashboard-disable-grade-visualizers"),
  },
}

export function SettingsPanel(props: {
  className?: string
}) {
  const hideGPA = settings.dashboard.useHideGPA()
  const hideGrades = settings.dashboard.useHideGrades()
  const disableGradeVisualizers = settings.dashboard.useDisableGradeVisualizers()

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
          checked={hideGPA.on}
          onChange={(value) => {
            hideGPA.set(!value)
          }}
        />
        <BooleanOption
          key="hide-grades"
          title="Hide Grades"
          description="Hide the grades widget on the dashboard."
          checked={hideGrades.on}
          onChange={(value) => {
            hideGrades.set(!value)
          }}
        />
        <BooleanOption
          key="disable-grade-viz"
          title="Disable Grade Warnings"
          description="Disable the coloring of grades as well as the progress circle shown next to the grades on the dashboard."
          checked={disableGradeVisualizers.on}
          onChange={(value) => {
            disableGradeVisualizers.set(!value)
          }}
        />
      </StaggeredList>
    </Panel>
  )
}
