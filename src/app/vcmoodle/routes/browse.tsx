import { Panel } from "@vcassist/ui"
import {
  ResourceType,
  type Course,
  type Resource,
  type Section,
} from "@backend.vcmoodle/api_pb"
import { TextInput } from "@mantine/core"
import { createRef, useEffect, useMemo, useState } from "react"
import {
  MdLink,
  MdOutlineBook,
  MdOutlineFolder,
  MdSearch,
} from "react-icons/md"
import { useHotkeys } from "@mantine/hooks"
import { PanelTitle, ListItemButton } from "./components"
import sanitize from "sanitize-html"
import type { IconType } from "react-icons"

function useScrollIntoViewRef(...dependsOn: unknown[]) {
  const selectedRef = createRef<HTMLDivElement>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: depending on selectedRef.current will not update when the element changes
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, dependsOn)

  return selectedRef
}

function Chapters(props: {
  resource: Resource
  selected?: number
  onSelect(idx?: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)

  if (props.resource.chapters.length === 0) {
    return <></>
  }

  return (
    <Panel className="flex flex-col gap-1 p-3 max-w-[280px]">
      <PanelTitle label="Chapters" />

      <div className="flex flex-col gap-1">
        {props.resource.chapters.map((c, idx) => {
          return (
            <ListItemButton
              key={c.id}
              selected={idx === props.selected}
              onClick={() => props.onSelect(idx)}
            >
              <p
                ref={idx === props.selected ? selectedRef : undefined}
                className="text-md"
              >
                {c.name}
              </p>
            </ListItemButton>
          )
        })}
      </div>
    </Panel>
  )
}

function Resources(props: {
  section: Section
  selected?: number
  onSelect(idx?: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)

  return (
    <Panel className="flex flex-col gap-1 p-3 max-w-[280px]">
      <PanelTitle label="Resources" />

      <div className="flex flex-col gap-1">
        {props.section.resources.map((r, idx) => {
          let icon: IconType

          switch (r.type) {
            case ResourceType.GENERIC_URL:
              icon = MdLink
              break
            case ResourceType.BOOK:
              icon = MdOutlineBook
              break
            case ResourceType.HTML_AREA:
              return (
                <ListItemButton
                  key={r.idx}
                  selected={idx === props.selected}
                  className="content"
                >
                  <div
                    ref={idx === props.selected ? selectedRef : undefined}
                    className="content"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: this is sanitized
                    dangerouslySetInnerHTML={{
                      __html: sanitize(r.displayContent),
                    }}
                  />
                </ListItemButton>
              )
          }

          return (
            <ListItemButton
              key={r.idx}
              icon={icon}
              selected={idx === props.selected}
              onClick={() => props.onSelect(idx)}
            >
              <p
                ref={idx === props.selected ? selectedRef : undefined}
                className="text-md"
              >
                {r.displayContent}
              </p>
            </ListItemButton>
          )
        })}
      </div>
    </Panel>
  )
}

function Sections(props: {
  course: Course
  selected?: number
  onSelect(idx?: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)
  const searchBoxRef = createRef<HTMLInputElement>()

  return (
    <div className="flex flex-col gap-3">
      <Panel className="flex flex-col gap-1 p-3 max-w-[280px]">
        <PanelTitle label="Sections" />

        <div className="flex flex-col gap-1">
          {props.course.sections.map((s, idx) => {
            return (
              <ListItemButton
                key={s.idx}
                icon={MdOutlineFolder}
                selected={idx === props.selected}
                onClick={() => props.onSelect(idx)}
              >
                <p
                  ref={idx === props.selected ? selectedRef : undefined}
                  className="text-md"
                >
                  {s.name}
                </p>
              </ListItemButton>
            )
          })}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-1 p-3 max-w-[280px]">
        <PanelTitle label={`Search in ${props.course.name}`} />
        <TextInput
          onChange={() => {}}
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

function Courses(props: {
  courses: Course[]
  selected?: number
  onSelect(idx?: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <Panel className="flex flex-col gap-1 p-3 max-w-[240px]">
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
            {props.courses.map((c, idx) => {
              return (
                <ListItemButton
                  key={c.id}
                  selected={idx === props.selected}
                  onClick={() => {
                    props.onSelect(idx)
                  }}
                >
                  <div ref={idx === props.selected ? selectedRef : undefined}>
                    <p className="text-md">{c.name}</p>
                    {c.teacher ? (
                      <p className="text-md text-dimmed" key={c.id}>
                        {c.teacher}
                      </p>
                    ) : undefined}
                  </div>
                </ListItemButton>
              )
            })}
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function Browse(props: {
  courses: Course[]
}) {
  const courses = useMemo(
    () =>
      props.courses
        .filter((c) => c.sections.length > 0)
        .map((c) => {
          c.sections = c.sections.filter((s) => s.resources.length > 0)
          return c
        })
        .sort((a, b) => {
          if (
            (a.teacher !== "" && b.teacher !== "") ||
            (a.teacher === "" && b.teacher === "")
          ) {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
          }
          if (a.teacher !== "") {
            return -1
          }
          if (b.teacher !== "") {
            return 1
          }
          return 0
        }),
    [props.courses],
  )

  const [path, setPath] = useState<(number | undefined)[]>([
    undefined, // selected course
    undefined, // selected section
    undefined, // selected resource
    undefined, // selected chapter
  ])
  const [cursor, setCursor] = useState(0)

  function pathCapacities() {
    return [
      courses.length,
      path[0] !== undefined ? courses[path[0]].sections.length : undefined,
      path[0] !== undefined && path[1] !== undefined
        ? courses[path[0]].sections[path[1]].resources.length
        : undefined,
      path[0] !== undefined && path[1] !== undefined && path[2] !== undefined
        ? courses[path[0]].sections[path[1]].resources[path[2]].chapters.length
        : undefined,
    ]
  }

  const down = () => {
    if (path[cursor] === undefined) {
      path[cursor] = 0
      setPath([...path])
      return
    }
    if (path[cursor] >= pathCapacities()[cursor]! - 1) {
      path[cursor] = undefined
      setPath([...path])
      return
    }
    path[cursor]!++
    setPath([...path])
  }

  const up = () => {
    if (path[cursor] === undefined) {
      path[cursor] = pathCapacities()[cursor]! - 1
      setPath([...path])
      return
    }
    if (path[cursor] === 0) {
      path[cursor] = undefined
      setPath([...path])
      return
    }
    path[cursor]--
    setPath([...path])
  }

  const left = () => {
    if (cursor === 0) {
      setPath([])
      return
    }
    path[cursor] = undefined
    setPath([...path])
    setCursor(cursor - 1)
  }

  const right = () => {
    if (path[cursor] === undefined) {
      path[cursor] = 0
      setPath([...path])
      return
    }
    if (cursor === 3 || pathCapacities()[cursor + 1] === 0) {
      return
    }
    path[cursor + 1] = 0
    setPath([...path])
    setCursor(cursor + 1)
  }

  useHotkeys([
    ["j", down],
    ["ArrowDown", down],
    ["k", up],
    ["ArrowUp", up],
    ["l", right],
    ["ArrowRight", right],
    ["h", left],
    ["ArrowLeft", left],
  ])

  return (
    <div className="flex gap-3">
      <Courses
        courses={courses}
        selected={path[0]}
        onSelect={(idx) => {
          setPath([idx])
        }}
      />

      {path[0] !== undefined ? (
        <Sections
          course={courses[path[0]]}
          selected={path[1]}
          onSelect={(idx) => {
            setPath([path[0], idx])
          }}
        />
      ) : undefined}

      {path[0] !== undefined && path[1] !== undefined ? (
        <Resources
          section={courses[path[0]].sections[path[1]]}
          selected={path[2]}
          onSelect={(idx) => {
            setPath([path[0], path[1], idx])
          }}
        />
      ) : undefined}

      {path[0] !== undefined &&
      path[1] !== undefined &&
      path[2] !== undefined ? (
        <Chapters
          resource={courses[path[0]].sections[path[1]].resources[path[2]]}
          selected={path[3]}
          onSelect={(idx) => {
            setPath([path[0], path[1], path[2], idx])
          }}
        />
      ) : undefined}
    </div>
  )
}
