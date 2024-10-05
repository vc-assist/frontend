import { dateFromUnix } from "@/lib/date";
import type { AssignmentData, CourseData } from "@backend.sis/data_pb";
import { Color, Panel } from "@vcassist/ui";
import { formatDistanceToNow, isAfter, isBefore, subDays, subMonths } from "date-fns"
import { Badge, SegmentedControl, Text, Title } from "@mantine/core";
import { useState } from "react";

enum IntervalBefore {
  DAYS_3_BEFORE = "3-days",
  WEEKS_1_BEFORE = "1-week",
  MONTHS_1_BEFORE = "1-month"
}

export function RecentScores(props: {
  courses: CourseData[]
}) {
  const [interval, setInterval] = useState<IntervalBefore>(IntervalBefore.DAYS_3_BEFORE)

  let lowerBound = new Date()
  switch (interval) {
    case IntervalBefore.DAYS_3_BEFORE:
      lowerBound = subDays(lowerBound, 3)
      break;
    case IntervalBefore.WEEKS_1_BEFORE:
      lowerBound = subDays(lowerBound, 7)
      break;
    case IntervalBefore.MONTHS_1_BEFORE:
      lowerBound = subMonths(lowerBound, 1)
      break;
  }
  const recentAssignments: { assignment: AssignmentData, date: Date }[] = []
  for (const c of props.courses) {
    for (const a of c.assignments) {
      const date = dateFromUnix(a.dueDate)
      if (isAfter(date, lowerBound)) {
        recentAssignments.push({ assignment: a, date })
      }
    }
  }
  recentAssignments.sort((a, b) => {
    if (isAfter(a.date, b.date)) {
      return -1
    }
    if (isBefore(a.date, b.date)) {
      return 1
    }
    return 0
  })

  return (
    <Panel className="flex flex-col gap-3 max-h-[500px] overflow-y-auto p-0 pb-5 relative">
      <div className="flex gap-3 justify-between items-center sticky top-0 px-5 pt-3">
        <div
          className="absolute left-0 top-0 w-full h-[70px] backdrop-blur-lg z-[-10] pointer-events-none"
          style={{ mask: "linear-gradient(black 50%, transparent)" }}
        />

        <Title order={4}>Recent Scores</Title>
        <SegmentedControl
          className="shadow-lg"
          data={[
            {
              label: "3 Days",
              value: IntervalBefore.DAYS_3_BEFORE,
            },
            {
              label: "Week",
              value: IntervalBefore.WEEKS_1_BEFORE,
            },
            {
              label: "Month",
              value: IntervalBefore.MONTHS_1_BEFORE,
            },
          ]}
          defaultValue="3-days"
          onChange={(value) => {
            setInterval(value as IntervalBefore)
          }}
        />
      </div>

      <div className="flex flex-col gap-3 px-5">
        {recentAssignments.map(({ assignment, date }, i) => {
          const color = assignment.pointsEarned !== undefined && assignment.pointsPossible !== undefined ?
            Color.fromGrade(assignment.pointsEarned / assignment.pointsPossible * 100) :
            "unset"

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: this is okay
            <Panel className="px-3 py-2" key={i}>
              <div className="flex gap-3 justify-between">
                <Text>{assignment.title}</Text>
                <Text style={{ color }}>{assignment.pointsEarned ?? '-'} / {assignment.pointsPossible ?? '-'}</Text>
              </div>

              <Text c="dimmed">{formatDistanceToNow(date, { addSuffix: true })}</Text>

              <div className="flex gap-3 flex-wrap">
                {assignment.isExempt ? <Badge c="grape">Exempt</Badge> : undefined}
                {assignment.isLate ? <Badge c="yellow">Late</Badge> : undefined}
                {assignment.isMissing ? <Badge c="orange">Missing</Badge> : undefined}
                {assignment.isIncomplete ? <Badge c="red">Incomplete</Badge> : undefined}
                {assignment.isCollected ? <Badge c="green">Collected</Badge> : undefined}
              </div>
            </Panel>
          )
        })}
      </div>
    </Panel>
  )
}
