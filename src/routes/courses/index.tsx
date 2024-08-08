import { Radio, Title, UnstyledButton } from "@mantine/core"
import {
  StaggeredList,
  useLayout,
  DrawerPanel,
  useSpan,
  createFnSpanner,
  Panel,
} from "@vcassist/ui"
import { isToday } from "date-fns"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import React, { useMemo, useState } from "react"
import { MdPages } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import type { Span } from "@opentelemetry/api"
import type { Course } from "@backend.studentdata/student_data_pb"
import sanitize from "sanitize-html"
import { dateFromUnix } from "@/lib/date"

const fnSpan = createFnSpanner("routes.courses")

function CourseDetails(props: {
  course: Course
  className?: string
  span: Span
}) {
  const clean = useMemo(
    () => sanitize(props.course.lessonPlan),
    [props.course.lessonPlan],
  )

  return (
    <div>
      <Panel className="flex flex-col gap-3">
        <Title className="font-bold" order={3}>
          {props.course.name}
        </Title>

        {clean ? (
          <div
            className="content"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: This html has been sanitized
            dangerouslySetInnerHTML={{ __html: clean }}
          />
        ) : (
          <p>No lesson plan was found for this course.</p>
        )}
      </Panel>
    </div>
  )
}

function CourseCard(props: {
  className?: string
  course: Course
  selected?: boolean
  onClick: () => void
}) {
  return (
    <UnstyledButton
      className={twMerge(
        "hover:-translate-y-1 active:translate-y-0 transition-all",
        props.className,
      )}
      onClick={props.onClick}
    >
      <Panel
        className="py-3 px-4 flex gap-3 items-center justify-between"
        noPadding
      >
        <Title order={5}>{props.course.name}</Title>

        <AnimatePresence>
          {props.selected ? (
            <motion.div
              className="p-2 bg-primary rounded-full"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
            />
          ) : undefined}
        </AnimatePresence>
      </Panel>
    </UnstyledButton>
  )
}

export default function Courses(props: { courses: Course[] }) {
  const span = useSpan(fnSpan, undefined, "courses")

  const layout = useLayout()

  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<string>()
  const selectedCourse = selected
    ? props.courses.find((c) => c.name === selected)
    : undefined

  const groups: { courses: Course[]; dayName?: string }[] = []
  course: for (const course of props.courses) {
    for (const g of groups) {
      if (course.dayName === g.dayName) {
        g.courses.push(course)
        continue course
      }
    }
    groups.push({ courses: [course], dayName: course.dayName })
  }

  groups.sort((a, b) => {
    if (a.dayName === b.dayName) {
      return 0
    }

    // if "a" has courses with meetings today, make "a" closer to the start
    for (const course of a.courses) {
      if (!course.dayName) {
        continue
      }
      for (const meeting of course.meetings) {
        if (isToday(dateFromUnix(meeting.startTime))) {
          return -1
        }
      }
    }
    // if "b" has courses with meetings today, make "b" closer to the start
    for (const course of b.courses) {
      if (!course.dayName) {
        continue
      }
      for (const meeting of course.meetings) {
        if (isToday(dateFromUnix(meeting.startTime))) {
          return 1
        }
      }
    }

    // if "a" has no dayName, make "a" closer to the end
    if (!a.dayName) {
      return -1
    }
    // if "b" has no dayName, make "b" closer to the end
    if (!b.dayName) {
      return 1
    }

    // sort strings ascending normally
    return a.dayName > b.dayName ? 1 : -1
  })

  if (layout === "mobile") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex w-full min-h-[calc(100vh_-_230px)]">
          <AnimatePresence>
            {selectedCourse ? (
              <CourseDetails
                className="flex-1"
                course={selectedCourse}
                span={span}
              />
            ) : (
              <div className="flex flex-col gap-3 m-auto items-center">
                <div className="w-full h-[75px]" />
                <Title>No course selected.</Title>
                <MdPages size={60} />
              </div>
            )}
          </AnimatePresence>
        </div>

        <DrawerPanel
          classNames={{ root: "sticky bottom-24 z-10" }}
          drawer={
            <Radio.Group
              name="selected-course"
              value={selected}
              onChange={(value) => {
                setSelected(value)
              }}
            >
              <div className="flex flex-col gap-3">
                {groups.map((group) => {
                  return (
                    <React.Fragment key={group.dayName}>
                      <Title order={6}>
                        {group.dayName ? `Day ${group.dayName}` : "Other"}
                      </Title>
                      <div className="flex flex-col gap-2">
                        {group.courses.map((course) => {
                          return (
                            <Radio
                              key={course.name}
                              classNames={{
                                label: "w-full",
                                labelWrapper: "w-full",
                              }}
                              value={course.name}
                              label={course.name}
                            />
                          )
                        })}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </Radio.Group>
          }
          expanded={expanded}
          onExpand={(expanded) => setExpanded(expanded)}
        >
          <Title className="flex-1" style={{ fontWeight: 500 }} order={4}>
            {expanded ? (selected ? selected : "Courses") : "Courses"}
          </Title>
        </DrawerPanel>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-[minmax(0,max-content)_1fr]">
      <div className="relative">
        <div className="flex flex-col gap-3 sticky top-0">
          <LayoutGroup>
            {groups.map((group) => {
              return (
                <StaggeredList
                  title={group.dayName ? `Day ${group.dayName}` : "Other"}
                  key={group.dayName}
                >
                  {group.courses.map((c) => {
                    return (
                      <CourseCard
                        className="w-full"
                        course={c}
                        onClick={() => {
                          setSelected(c.name)
                        }}
                        key={c.name}
                        selected={selected === c.name}
                      />
                    )
                  })}
                </StaggeredList>
              )
            })}
          </LayoutGroup>
        </div>
      </div>
      <AnimatePresence>
        {selectedCourse ? (
          <CourseDetails
            className="flex-1"
            course={selectedCourse}
            span={span}
          />
        ) : undefined}
      </AnimatePresence>
    </div>
  )
}
