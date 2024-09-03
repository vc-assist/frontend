import CourseChip from "@/src/components/CourseChip"
import type { CourseData } from "@backend.sis/data_pb"
import { Color, InfoTooltip, RingProgress, WidgetPanel } from "@vcassist/ui"
import { Fragment } from "react"

export default function GradeList(props: {
  className?: string
  courses: CourseData[]
  dayNames: string[]
  plain?: boolean
}) {
  props.courses.sort((a, b) => b.overallGrade - a.overallGrade)

  return (
    <WidgetPanel
      className={props.className}
      title="Grade List"
      titleBarRight={
        <div>
          <InfoTooltip message="Our grade calculations aren't perfect. If the calculated result is more than 1% off the official grade, we will display the official grade instead." />
        </div>
      }
    >
      <div
        className="grid items-center gap-y-6 gap-x-5 w-full overflow-hidden"
        style={{
          gridTemplateColumns: "minmax(0px, 1fr) min-content min-content",
        }}
      >
        {props.courses.map((course) => {
          const grade = Math.round(course.overallGrade * 100) / 100
          return (
            <Fragment key={course.name}>
              <div className="w-full">
                <CourseChip
                  dayNames={props.dayNames}
                  classNames={{
                    root: "w-full",
                    text: "clamp-text",
                  }}
                  course={course}
                  disableGradeColoring={props.plain}
                />
              </div>

              {!props.plain && grade >= 0 ? (
                <RingProgress
                  size={24}
                  thickness={3}
                  sections={[
                    {
                      color: Color.fromGrade(grade),
                      value: grade,
                    },
                  ]}
                />
              ) : (
                <div />
              )}

              {grade >= 0 ? (
                <p className="text-[15px] whitespace-nowrap">{grade}%</p>
              ) : (
                <div />
              )}
            </Fragment>
          )
        })}
      </div>
    </WidgetPanel>
  )
}
