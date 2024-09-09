import { Panel } from "@vcassist/ui"
import {
  ResourceType,
  type Chapter,
  type Course,
  type Resource,
  type Section,
} from "@backend.vcmoodle/api_pb"
import { Kbd, TextInput } from "@mantine/core"
import { createRef, useEffect, useMemo, useState } from "react"
import {
  MdLink,
  MdOutlineArticle,
  MdOutlineBook,
  MdOutlineFolder,
  MdSearch,
} from "react-icons/md"
import { useHotkeys } from "@mantine/hooks"
import { PanelTitle, ListItemButton } from "./components"
import sanitize from "sanitize-html"
import type { IconType } from "react-icons"
import { useRouteContext } from "@/src/components/Router"
import { ChapterDisplay } from "./chapter-content"
import { useVCMoodleClient } from "../providers"

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
  onShow(idx: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)

  useHotkeys([
    [
      "Enter",
      () => {
        if (
          props.resource.chapters.length === 0 ||
          props.selected === undefined
        ) {
          return
        }
        props.onShow(props.selected)
      },
    ],
  ])

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
              icon={MdOutlineArticle}
              selected={idx === props.selected}
              onClick={() => {
                props.onSelect(idx)
                props.onShow(idx)
              }}
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
  onShow(idx: number): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)

  useHotkeys([
    [
      "Enter",
      () => {
        if (props.selected === undefined) {
          return
        }
        props.onShow(props.selected)
      },
    ],
  ])

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
                  onClick={() => {
                    props.onSelect(idx)
                  }}
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
              onClick={() => {
                props.onSelect(idx)
                props.onShow(idx)
              }}
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
  search?: string
  onSearch(value: string): void
}) {
  const selectedRef = useScrollIntoViewRef(props.selected)
  const searchBoxRef = createRef<HTMLInputElement>()

  useHotkeys([["/", () => searchBoxRef.current?.focus()]])

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
          ref={searchBoxRef}
          placeholder="Search"
          leftSection={<MdSearch size={20} />}
          value={props.search}
          onChange={(e) => {
            props.onSearch(e.currentTarget.value)
          }}
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

      <Panel className="flex flex-col gap-1">
        <div className="flex gap-3">
          <div>
            <Kbd>k</Kbd> / ̷<Kbd>↑</Kbd>
          </div>
          <p>Up</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>j</Kbd> / ̷<Kbd>↓</Kbd>
          </div>
          <p>Down</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>h</Kbd> / ̷<Kbd>←</Kbd>
          </div>
          <p>Left</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>l</Kbd> / ̷<Kbd>→</Kbd>
          </div>
          <p>Right</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>/</Kbd>
          </div>
          <p>Focus search bar</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>ESC</Kbd>
          </div>
          <p>Defocus search bar</p>
        </div>

        <div className="flex gap-3">
          <div>
            <Kbd>ENTER</Kbd>
          </div>
          <p>Open link / lesson plan</p>
        </div>
      </Panel>
    </div>
  )
}

// this is probably not idiomatic react
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

  const { params } = useRouteContext()

  function getInitialPath() {
    const defaultPath = [
      undefined, // selected course
      undefined, // selected section
      undefined, // selected resource
      undefined, // selected chapter
    ]
    if (!Array.isArray(params)) {
      return defaultPath
    }

    const courseIdx = courses.findIndex((c) => c.id === params[0])
    if (courseIdx < 0) {
      return defaultPath
    }

    const sectionIdx = Number(params[1])
    const resourceIdx = Number(params[2])

    if (params[3] === undefined) {
      return [courseIdx, sectionIdx, resourceIdx]
    }

    const chapterIdx = courses[courseIdx].sections[sectionIdx].resources[
      resourceIdx
    ].chapters.findIndex((c) => c.id === params[3])
    return [courseIdx, sectionIdx, resourceIdx, chapterIdx]
  }

  const [path, setPath] = useState<(number | undefined)[]>(getInitialPath())
  const [cursor, setCursor] = useState(
    Array.isArray(params) ? params.length - 1 : 0,
  )

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

  const [shownChapter, setShownChapter] = useState<Chapter>()
  const chapterDisplayRef = createRef<HTMLDivElement>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is always during render, you must change on state change
  useEffect(() => {
    chapterDisplayRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }, [shownChapter])

  const client = useVCMoodleClient()

  const [search, setSearch] = useState("")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Courses
          courses={courses}
          selected={path[0]}
          onSelect={(idx) => {
            setPath([idx])
            setCursor(0)
          }}
        />

        {path[0] !== undefined ? (
          <Sections
            course={courses[path[0]]}
            selected={path[1]}
            onSelect={(idx) => {
              setPath([path[0], idx])
              setCursor(1)
            }}
            search={search}
            onSearch={(value) => {
              setSearch(value)
            }}
          />
        ) : undefined}

        {path[0] !== undefined && path[1] !== undefined ? (
          <Resources
            section={courses[path[0]].sections[path[1]]}
            selected={path[2]}
            onSelect={(idx) => {
              setPath([path[0], path[1], idx])
              setCursor(2)
            }}
            onShow={(idx) => {
              const resource =
                courses[path[0]!].sections[path[1]!].resources[idx]
              if (resource.type !== ResourceType.GENERIC_URL) {
                return
              }
              window.open(resource.url)
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
              setCursor(3)
            }}
            onShow={(idx) => {
              const chapter =
                courses[path[0]!].sections[path[1]!].resources[path[2]!]
                  .chapters[idx]
              setShownChapter(chapter)
            }}
          />
        ) : undefined}
      </div>

      {shownChapter ? (
        <div ref={chapterDisplayRef}>
          <ChapterDisplay
            chapter={shownChapter}
            content={{
              key: Number(shownChapter.id),
              async fetch() {
                const res = await client.getChapterContent({
                  id: shownChapter.id,
                })
                return res.html
              },
            }}
          />
        </div>
      ) : undefined}
    </div>
  )
}
