import type { StudentData } from "@backend.studentdata/student_data_pb"
import { useSignals } from "@preact/signals-react/runtime"
import { WidgetHiddenPanel, createDefaultMeter } from "@vcassist/ui"
import { useEffect } from "react"
import DayBlock from "../dashboard/DayBlock"
import Gpa from "../dashboard/Gpa"
import GradeList from "../dashboard/GradeList"
import Schedule from "../dashboard/Schedule"
import { settings } from "../profile/Settings"

const meter = createDefaultMeter("routes.dashboard")
const viewPage = meter.createCounter("view")

export default function Dashboard({
  data,
}: {
  data: StudentData
}) {
  useSignals()

  useEffect(() => {
    viewPage.add(1)
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        {/* grid is used here so I don't have to deal with
        flexbox flex shenanigans */}
        <div className="grid grid-cols-2 gap-6">
          <DayBlock dayNames={data.dayNames} currentDay="" />
          {!settings.dashboard.hideGPA.value ? (
            <Gpa gpa={data.gpa} />
          ) : (
            <WidgetHiddenPanel message="GPA is hidden" />
          )}
        </div>
        <Schedule
          className="overflow-visible"
          dayNames={data.dayNames}
          courses={data.courses}
        />
      </div>
      {!settings.dashboard.hideGrades.value ? (
        <GradeList
          className="w-full"
          dayNames={data.dayNames}
          courses={data.courses}
          plain={settings.dashboard.disableGradeVisualizers.value}
        />
      ) : (
        <WidgetHiddenPanel
          className="max-h-[500px] min-h-[300px]"
          message="Grade List is hidden"
        />
      )}
    </div>
  )
}
