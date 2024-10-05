import { dateFromUnix } from "@/lib/date"
import { settings } from "@/src/components/profile/Settings"
import type { Data } from "@backend.sis/api_pb"
import { WidgetHiddenPanel, createDefaultMeter, useLayout } from "@vcassist/ui"
import { useEffect } from "react"
import DayBlock from "./DayBlock"
import Gpa from "./Gpa"
import GradeList from "./GradeList"
import Schedule from "./Schedule"
import { RecentScores } from "./RecentScores"
import { twMerge } from "tailwind-merge"

const meter = createDefaultMeter("routes.dashboard")
const viewPage = meter.createCounter("view")

export default function Dashboard({ data }: { data: Data }) {
  const layout = useLayout()

  useEffect(() => {
    viewPage.add(1)
  }, [])

  const daySet = new Set<string>()
  for (const course of data.courses) {
    daySet.add(course.dayName)
  }
  const dayNames = Array.from(daySet)

  const now = new Date()
  let currentDay = ""
  courses: for (const course of data.courses) {
    for (const meeting of course.meetings) {
      const startDate = dateFromUnix(meeting.start)
      if (
        startDate.getFullYear() === now.getFullYear() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getDate() === now.getDate()
      ) {
        currentDay = course.dayName
        break courses
      }
    }
  }

  const hideGPA = settings.dashboard.hideGPA((s) => s.on)
  const hideGrades = settings.dashboard.hideGrades((s) => s.on)
  const disableGradeVisualizers = settings.dashboard.disableGradeVisualizers(
    (s) => s.on,
  )

  const columnClass = twMerge("flex flex-col gap-6", layout === "desktop" ? "flex-1" : "")

  return (
    <div className={twMerge("flex gap-6 w-full", layout === "mobile" ? "flex-col" : "")}>
      <div className={columnClass}>
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

      <div className={columnClass}>
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
        <RecentScores courses={data.courses} />
      </div>
    </div>
  )
}
