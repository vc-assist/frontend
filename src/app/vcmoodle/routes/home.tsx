import { LinkButton, Panel, useLayout } from "@vcassist/ui"
import type {
  Chapter,
  Course,
  Section,
  Resource,
} from "@backend.vcmoodle/api_pb"
import { PanelTitle } from "./components"
import sanitize from "sanitize-html"
import { createRef, useEffect, useMemo, useState } from "react"
import {
  depromoteNonSectionHeaders,
  type LessonPlanSection,
  removeEmptySpace,
  removeNodeWithText,
  segmentLessonPlan,
} from "./lesson-plan-processing"
import { Divider, ActionIcon } from "@mantine/core"
import { MdArrowForward, MdLink, MdRawOff, MdRawOn } from "react-icons/md"
import { twMerge } from "tailwind-merge"

function CourseLessonPlan(props: {
  course: Course
  section: Section
  resource: Resource
  chapter: Chapter
}) {
  const layout = useLayout()
  const contentRef = createRef<HTMLDivElement>()
  const [raw, setRaw] = useState(false)

  const sanitizedContent = useMemo(
    () => sanitize(props.chapter.homepageContent),
    [props.chapter.homepageContent],
  )

  // cursed vanilla js dom manipulation within react
  useEffect(() => {
    if (raw) {
      return
    }

    const contentRoot = contentRef.current
    if (!contentRoot) {
      return
    }

    removeEmptySpace(contentRoot)
    removeNodeWithText(contentRoot, props.chapter.name)
    depromoteNonSectionHeaders(contentRoot)

    const sections: LessonPlanSection[] = []
    segmentLessonPlan(contentRoot, sections)

    for (const sec of sections) {
      if (sec.content.length === 0) {
        continue
      }

      const parent = sec.title.parentElement
      if (parent === null) {
        console.error("parent of title could not possibly be null!")
        continue
      }

      const title = document.createElement("h5")
      title.innerHTML = sec.title.innerHTML
      sec.title.replaceWith(title)

      const button = document.createElement("button")
      // this icon is: https://remixicon.com/icon/arrow-down-s-line
      button.innerHTML = `<svg class="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path></svg>`
      button.className = "mx-1 rounded-lg hover:bg-dimmed-subtle"
      button.style.padding = "0.15rem"
      button.style.color = "currentColor"

      for (const e of sec.content) {
        e.classList.add("overflow-hidden")
      }

      const expandEffect = (expanded: boolean) => {
        button.style.transform = expanded
          ? "translateY(4px)"
          : "rotate(180deg) translateY(-4px)"

        if (!expanded) {
          title.classList.remove("text-primary")
          title.classList.add("text-dimmed")
        } else {
          title.classList.remove("text-dimmed")
          title.classList.add("text-primary")
        }
        for (const e of sec.content) {
          if (!expanded) {
            e.style.maxHeight = "0"
            e.style.margin = "0"
          } else {
            e.style.maxHeight = "unset"
            e.style.margin = "unset"
          }
        }
      }

      let expanded = sec.shownByDefault
      expandEffect(expanded)
      button.onclick = () => {
        expanded = !expanded
        expandEffect(expanded)
      }

      title.append(button)
    }

    return () => {
      contentRoot.innerHTML = sanitizedContent
    }
  }, [contentRef, sanitizedContent, props.chapter.name, raw])

  return (
    <Panel
      className={twMerge(
        "flex flex-col gap-3",
        layout === "mobile" ? "w-full" : "xl:max-w-lg 2xl:max-w-2xl",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          <PanelTitle label={props.course.name} />

          <div className="flex gap-2">
            <ActionIcon
              variant="subtle"
              onClick={() => {
                window.open(props.chapter.url)
              }}
            >
              <MdLink />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              onClick={() => {
                setRaw(!raw)
              }}
            >
              {raw ? (
                <MdRawOn className="size-6" />
              ) : (
                <MdRawOff className="size-6" />
              )}
            </ActionIcon>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap items-center">
          <LinkButton className="p-0">{props.section.name}</LinkButton>
          <MdArrowForward />
          <LinkButton className="p-0">{props.chapter.name}</LinkButton>
        </div>
      </div>

      <Divider />

      <div
        ref={contentRef}
        className="content"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: sanitizedContent,
        }}
      />
    </Panel>
  )
}

export function Home(props: {
  courses: Course[]
}) {
  const traces: {
    course: Course
    section: Section
    resource: Resource
    chapter: Chapter
  }[] = []

  for (const course of props.courses) {
    for (const section of course.sections) {
      for (const resource of section.resources) {
        for (const chapter of resource.chapters) {
          if (chapter.homepageContent !== "") {
            traces.push({ course, section, resource, chapter })
          }
        }
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-5">
      {traces.map((trace) => {
        return <CourseLessonPlan key={trace.course.id} {...trace} />
      })}
    </div>
  )
}
