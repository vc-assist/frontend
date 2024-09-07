import { Panel } from "@/ui"
import type { Course, GetCoursesResponse } from "@backend.vcmoodle/api_pb"
import { TextInput } from "@mantine/core"
import { createRef, useMemo, useState } from "react"
import { MdSearch } from "react-icons/md"
import { useHotkeys } from '@mantine/hooks';
import Fuse, { type FuseResult } from "fuse.js"
import { PanelTitle, SectionButton } from "./components"

export function Chapters() { }

export function Sections(props: {
  courseName: string
  course: Course
  selected?: number
  onSelect(idx: number): void
}) {
  const searchBoxRef = createRef<HTMLInputElement>()

  return (
    <div className="flex flex-col gap-3">
      <Panel className="flex flex-col gap-3 p-3 max-w-[280px]">
        <PanelTitle label="Sections" />

        <div className="flex flex-col gap-1">
          {props.course.sections.map((s, idx) => {
            return (
              <SectionButton
                key={s.idx}
                selected={idx === props.selected}
                onClick={() => props.onSelect(idx)}
              >
                <p className="text-md">
                  {s.name}
                </p>
              </SectionButton>
            )
          })}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3 p-3 max-w-[280px]">
        <PanelTitle label={`Search in ${props.courseName}`} />
        <TextInput
          ref={searchBoxRef}
          placeholder="Search"
          leftSection={<MdSearch size={20} />}
          value={""}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur()
            }
          }}
        />
      </Panel>
    </div>
  )
}

enum FocusState {
  COURSES = 0,
  SECTIONS = 1,
  RESOURCES = 2,
  CHAPTERS = 3
}

class BrowseState {
  focusState: FocusState = FocusState.COURSES
  // courseIdx
  selectedCourse: number | undefined
  // courseIdx -> sectionIdx
  selectedSection: Map<number, number>
  // courseIdx:sectionIdx -> resourceIdx
  selectedResource: Map<string, number>
  // courseIdx:sectionIdx:resourceIdx -> chapterIdx
  selectedChapter: Map<string, number>

  constructor() {
    this.selectedSection = new Map()
    this.selectedResource = new Map()
  }
}

export function Courses(props: {
  courses: GetCoursesResponse
}) {
  const [focusState, setFocusState] = useState<FocusState>()

  const [selectedCourse, setSelectedCourse] = useState<number>()
  const [selectedSection, setSelectedSection] = useState<number>()
  const [selectedResource, setSelectedResource] = useState<number>()
  const [selectedChapter, setSelectedChapter] = useState<number>()

  const searchBoxRef = createRef<HTMLInputElement>()

  const courses = useMemo(() => props.courses.courses
    .map((c) => {
      const [name, teacher] = c.name.split(" - ").map(s => s.trim())
      return { underlying: c, name, teacher }
    })
    .filter((c) => c.underlying.sections.length > 0)
    .sort((a, b) => {
      if (
        (a.teacher !== undefined && b.teacher !== undefined) ||
        (a.teacher === undefined && b.teacher === undefined)
      ) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
      if (a.teacher !== undefined) {
        return -1
      }
      if (b.teacher !== undefined) {
        return 1
      }
      return 0
    }), [props.courses.courses])

  const next = () => {
    if (selectedCourse === undefined) {
      setSelectedCourse(0)
      return
    }
    if (selectedCourse === courses.length - 1) {
      setSelectedCourse(undefined)
      return
    }
    setSelectedCourse(selectedCourse + 1)
  }

  const prev = () => {
    if (selectedCourse === undefined) {
      setSelectedCourse(courses.length - 1)
      return
    }
    if (selectedCourse === 0) {
      setSelectedCourse(undefined)
      return
    }
    setSelectedCourse(selectedCourse - 1)
  }

  // const focusSearch = () => {
  //   searchBoxRef.current?.focus()
  // }

  useHotkeys([
    ["j", next],
    ["ArrowDown", next],
    ["k", prev],
    ["ArrowUp", prev],
    // ["/", focusSearch],
  ])

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <Panel className="flex flex-col gap-3 p-3 max-w-[240px]">
            <PanelTitle label="Courses" />

            {/* <TextInput */}
            {/*   ref={searchBoxRef} */}
            {/*   placeholder="Search" */}
            {/*   leftSection={<MdSearch size={20} />} */}
            {/*   value={""} */}
            {/*   onKeyDown={(e) => { */}
            {/*     if (e.key === "Escape") { */}
            {/*       e.currentTarget.blur() */}
            {/*     } */}
            {/*   }} */}
            {/* /> */}

            <div className="flex flex-col gap-1">
              {courses.map((c, idx) => {
                return (
                  <SectionButton
                    key={c.underlying.id}
                    selected={idx === selectedCourse}
                    onClick={() => {
                      setSelectedCourse(idx)
                    }}
                  >
                    <p className="text-md">
                      {c.name}
                    </p>
                    {c.teacher ?
                      <p className="text-md text-dimmed" key={c.underlying.id}>
                        {c.teacher}
                      </p>
                      : undefined}
                  </SectionButton>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>

      {selectedCourse !== undefined ?
        <Sections course={courses[selectedCourse].underlying} courseName={courses[selectedCourse].name} onSelect={() => { }} />
        : undefined}
    </div>
  )
}

