import type { CourseData } from "@backend.sis/data_pb"
import { Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { PopoutChip } from "@vcassist/ui"
import { Color } from "@vcassist/ui/lib/color"
import { type CSSProperties, useState } from "react"
import { MdClass, MdInfo, MdInfoOutline } from "react-icons/md"
import { twMerge } from "tailwind-merge"

const iconStyle: Partial<CSSProperties> = {
  minWidth: "18px",
  maxWidth: "18px",
  minHeight: "18px",
  maxHeight: "18px",
}

export default function CourseChip(props: {
  course: CourseData
  classNames?: Partial<{
    root: string
    text: string
    icon: string
  }>
  dayNames: string[]
  disableGradeColoring?: boolean
}) {
  const [opened, setOpened] = useState(false)
  const dayName = props.course.dayName
  // const meetingLink = props.course.remoteMeetingLink
  const overallGrade = Math.round(props.course.overallGrade)

  return (
    <PopoutChip
      className={twMerge("flex gap-2 items-center", props.classNames?.root)}
      title={props.course.name}
      icon={MdClass}
      onOpened={(opened) => setOpened(opened)}
      chip={
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap max-w-[250px]">
            <div className="flex flex-col gap-1">
              <Text>Grade</Text>
              <Text
                className="select-all"
                style={
                  !props.disableGradeColoring
                    ? {
                        color: Color.fromGrade(overallGrade),
                      }
                    : undefined
                }
              >
                {overallGrade}%
              </Text>
            </div>

            <div className="flex flex-col gap-1">
              <Text>Instructor</Text>
              {props.course.teacherEmail ? (
                <button
                  type="button"
                  className="no-underline hover:underline text-blue-400 dark:text-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(props.course.teacherEmail)
                    notifications.show({
                      color: "green",
                      message: "Email copied to clipboard!",
                      autoClose: 3000,
                    })
                  }}
                >
                  {props.course.teacher}
                </button>
              ) : (
                <Text c="dimmed">{props.course.teacher}</Text>
              )}
            </div>

            {props.course.room ? (
              <div className="flex flex-col gap-1">
                <Text>Room</Text>
                <Text className="select-all" c="dimmed">
                  {props.course.room}
                </Text>
              </div>
            ) : undefined}

            {props.course.homeworkPasses !== undefined ? (
              <div className="flex flex-col gap-1">
                <Text>Homework passes</Text>
                <Text className="select-all" c="dimmed">
                  {props.course.homeworkPasses}
                </Text>
              </div>
            ) : undefined}
          </div>

          {/* {meetingLink ? ( */}
          {/*   <Button */}
          {/*     size="xs" */}
          {/*     className="w-fit" */}
          {/*     variant="gradient" */}
          {/*     onClick={() => { */}
          {/*       window.open(meetingLink) */}
          {/*     }} */}
          {/*     leftSection={<MdVideocam size={18} />} */}
          {/*   > */}
          {/*     Meeting */}
          {/*   </Button> */}
          {/* ) : undefined} */}

          {dayName ? (
            <div className="flex gap-1 col-span-2">
              <div
                className="px-3 py-2 rounded-lg bg-bg-dimmed"
                style={{
                  background:
                    Color.DAY_COLORS_LIST[
                      props.dayNames.findIndex((value) => value === dayName)
                    ] ?? "black",
                }}
                key={dayName}
              >
                <p className="font-bold text-sm text-gray-50">{dayName}</p>
              </div>
            </div>
          ) : undefined}
        </div>
      }
    >
      <Text
        className={twMerge("w-fit", props.classNames?.text)}
        style={{ fontWeight: 500 }}
      >
        {props.course.name}
      </Text>
      {!opened ? (
        <MdInfoOutline className={props.classNames?.icon} style={iconStyle} />
      ) : (
        <MdInfo className={props.classNames?.icon} style={iconStyle} />
      )}
    </PopoutChip>
  )
}
