import type { Course } from "@backend.studentdata/student_data_pb"
import { ActionIcon, Badge, Text, Timeline } from "@mantine/core"
import { WidgetPanel, useCurrentTime } from "@vcassist/ui"
import {
  add,
  compareAsc,
  format,
  formatDistance,
  formatDuration,
  intervalToDuration,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
} from "date-fns"
import { useMemo, useState } from "react"
import {
  MdCalendarToday,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdRestore,
  MdVideocam,
} from "react-icons/md"
import CourseChip from "../../CourseChip"

export default function Schedule(props: {
  courses: Course[]
  dayNames: string[]
  className?: string
}) {
  const currentTime = useCurrentTime()
  const [dayOffset, setDayOffset] = useState(0)

  const now = add(currentTime, { days: dayOffset })

  const { minDate, maxDate } = useMemo(() => {
    let minDate = new Date()
    let maxDate = new Date()
    for (const c of props.courses) {
      for (const meeting of c.meetings) {
        if (isBefore(meeting.startTime, minDate)) {
          minDate = meeting.startTime
        }
        if (isAfter(meeting.startTime, maxDate)) {
          maxDate = meeting.startTime
        }
      }
    }
    return { minDate, maxDate }
  }, [props.courses])

  const sections = useMemo(() => {
    const result: {
      course: Course
      startTime: Date
      endTime: Date
    }[] = []
    for (const c of props.courses) {
      for (const meeting of c.meetings) {
        if (isSameDay(now, meeting.startTime)) {
          result.push({
            course: c,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
          })
        }
      }
    }
    result.sort((a, b) => compareAsc(a.startTime, b.startTime))
    return result
  }, [props.courses, now])

  const [items, active] = useMemo(() => {
    let active = -1
    const items: React.ReactNode[] = []

    for (const section of sections) {
      const course = section.course

      const inFuture = compareAsc(section.startTime, now) > 0
      if (!inFuture) {
        active++
      }
      const inProgress = compareAsc(section.endTime, now) > 0 && !inFuture
      const toStart = formatDistance(section.startTime, now, {
        addSuffix: true,
      })

      let timeLabel = toStart
      if (inProgress) {
        const duration = intervalToDuration({
          start: now,
          end: section.endTime,
        })
        timeLabel = `${formatDuration({
          hours: duration.hours,
          minutes: duration.minutes,
          seconds: duration.seconds,
        })} left`
      }

      const remoteMeetingLink = course.remoteMeetingLink

      items.push(
        <Timeline.Item key={course.name}>
          <div className="flex gap-3 items-center">
            <CourseChip dayNames={props.dayNames} course={course} />
            {remoteMeetingLink ? (
              <ActionIcon
                size="sm"
                variant="gradient"
                onClick={() => {
                  window.open(remoteMeetingLink)
                }}
              >
                <MdVideocam />
              </ActionIcon>
            ) : undefined}
          </div>
          <Text className="font-normal" c="dimmed">
            {[
              course.teacher,
              "•",
              format(section.startTime, "h:mm a"),
              "-",
              format(section.endTime, "h:mm a"),
            ].join(" ")}
          </Text>
          <Text
            className="font-normal"
            size="sm"
            c={!inProgress ? "dimmed" : undefined}
          >
            {timeLabel}
          </Text>
        </Timeline.Item>,
      )
    }

    return [items, active]
  }, [sections, now, props.dayNames])

  const titleBarRight = (
    <div className="flex gap-2 items-center">
      {isToday(now) ? (
        <Badge c="white" bg="blue">
          Today
        </Badge>
      ) : undefined}
      <div className="flex gap-1">
        {dayOffset !== 0 ? (
          <ActionIcon onClick={() => setDayOffset(0)}>
            <MdRestore size={22} />
          </ActionIcon>
        ) : undefined}
        <ActionIcon
          onClick={() => setDayOffset(dayOffset - 1)}
          disabled={isSameDay(now, minDate) || isBefore(now, minDate)}
        >
          <MdKeyboardArrowLeft size={22} />
        </ActionIcon>
        <ActionIcon
          onClick={() => setDayOffset(dayOffset + 1)}
          disabled={isSameDay(now, maxDate) || isAfter(now, maxDate)}
        >
          <MdKeyboardArrowRight size={22} />
        </ActionIcon>
      </div>
    </div>
  )
  const summaryTitle = `Daily Schedule (${format(now, "MMM dd, yyyy")})`

  if (items.length === 0) {
    return (
      <WidgetPanel
        className={props.className}
        title={summaryTitle}
        titleBarRight={titleBarRight}
      >
        <div className="flex min-h-[300px]">
          <div className="m-auto flex gap-1">
            <MdCalendarToday size={20} />
            <Text>No class today!</Text>
          </div>
        </div>
      </WidgetPanel>
    )
  }

  return (
    <WidgetPanel
      className={props.className}
      title={summaryTitle}
      titleBarRight={titleBarRight}
    >
      <Timeline
        color="blue"
        active={active}
        bulletSize={24}
        lineWidth={4}
        classNames={{
          itemContent: "flex flex-col gap-1",
        }}
      >
        {items}
      </Timeline>
    </WidgetPanel>
  )
}
