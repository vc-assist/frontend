import { useRouteContext } from "@/src/components/Router"
import type {
  Chapter,
  Course,
  Resource,
  Section,
} from "@backend.vcmoodle/api_pb"
import { ActionIcon, Divider, useComputedColorScheme } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { LinkButton, Panel, useLayout } from "@vcassist/ui"
import { createRef, useEffect, useMemo, useState } from "react"
import { MdArrowForward, MdLink, MdRawOff, MdRawOn } from "react-icons/md"
import sanitize from "sanitize-html"
import { twMerge } from "tailwind-merge"
import type { BrowseParams } from "../browse"
import { PanelTitle } from "./PanelTitle"
import {
  type LessonPlanSection,
  demoteNonSectionHeaders,
  handleLinks,
  highlightDangerKeywords,
  removeEmptySpace,
  removeNodeWithText,
  segmentLessonPlan,
} from "./lesson-plan-processing"

// import * as PDFJS from "pdfjs-dist"
// import Worker from "pdfjs-dist/build/pdf.worker.mjs?worker"
// PDFJS.GlobalWorkerOptions.workerPort = new Worker()

function ChapterContent(props: {
  courseId: number
  chapterName: string
  sanitizedContent: string
  openFile: (href: string) => void
}) {
  const colorScheme = useComputedColorScheme()
  const contentRef = createRef<HTMLDivElement>()

  // cursed vanilla js dom manipulation within react
  useEffect(() => {
    const contentRoot = contentRef.current
    if (!contentRoot) {
      return
    }

    removeEmptySpace(contentRoot)
    removeNodeWithText(contentRoot, props.chapterName)
    demoteNonSectionHeaders(contentRoot)
    highlightDangerKeywords(
      contentRoot,
      colorScheme === "light" ? "bg-red-300" : "bg-red-700",
    )
    handleLinks(contentRoot, (href) => {
      if (href.includes("learn.vcs.net") && href.includes("/mod/resource")) {
        props.openFile(href)
        return
      }
      window.open(href)
    })

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
      contentRoot.innerHTML = props.sanitizedContent
    }
  }, [
    contentRef,
    props.sanitizedContent,
    props.chapterName,
    colorScheme,
    props.openFile,
  ])

  return (
    <div
      // react doesn't update dangerouslySetInnerHTML for some reason
      // but adding a unique key every render forces it to rerender
      // making things ok
      key={new Date().getTime()}
      ref={contentRef}
      className="content select-text"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{
        __html: props.sanitizedContent,
      }}
      data-course-id={props.courseId}
    />
  )
}

// function PdfViewer(props: {
//   pdf: PDFDocumentProxy
// }) {
//   const container = createRef<HTMLDivElement>()
//
//   useEffect(() => {
//     if (!container.current) {
//       return
//     }
//
//     console.log(container.current)
//     const viewer = new PDFViewer({
//       eventBus: new EventBus(),
//       container: container.current,
//     })
//     viewer.setDocument(props.pdf)
//
//     return () => {
//       viewer.cleanup()
//     }
//   }, [container.current, props.pdf])
//
//   return <div ref={container} />
// }

export function ChapterDisplay(props: {
  courseId: number
  chapter: Chapter
  content?: {
    key: string | number | boolean
    fetch: () => Promise<string>
  }
  breadcrumb?: {
    course: Course
    section: Section
    resource: Resource
  }
}) {
  const { push } = useRouteContext()

  const layout = useLayout()
  const [raw, setRaw] = useState(false)

  // const [openedFile, setOpenedFile] = useState<string>()
  // const fileContents = useQuery({
  //   queryKey: ["getFileContent", openedFile],
  //   queryFn: async () => {
  //     if (!openedFile) {
  //       return null
  //     }
  //
  //     const res = await client.getFileContent({ url: openedFile })
  //
  //     const isPdf =
  //       res.file[0] === 37 &&
  //       res.file[1] === 80 &&
  //       res.file[2] === 68 &&
  //       res.file[3] === 70
  //     if (!isPdf) {
  //       return res.file
  //     }
  //
  //     const loadingTask = PDFJS.getDocument(res.file)
  //     return await loadingTask.promise
  //   },
  // })

  const sanitizedHomepageContent = useMemo(
    () => sanitize(props.chapter.homepageContent),
    [props.chapter.homepageContent],
  )

  const contentQuery = useQuery({
    queryKey: ["chapterContentFetch", props.content?.key],
    queryFn: () => props.content?.fetch() ?? null,
  })

  const content = contentQuery.data
    ? contentQuery.data
    : sanitizedHomepageContent

  return (
    <>
      {/* {fileContents.data && !(fileContents.data instanceof Uint8Array) ? */}
      {/*   <Portal> */}
      {/*     <div className="fixed top-0 left-0 w-full h-full"> */}
      {/*       <PdfViewer pdf={fileContents.data} /> */}
      {/*     </div> */}
      {/*   </Portal> */}
      {/*   : undefined} */}

      <Panel
        className={twMerge(
          "flex flex-col gap-3",
          layout === "mobile" ? "w-full" : "xl:max-w-lg 2xl:max-w-2xl",
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-3">
            <PanelTitle
              className="select-all"
              label={
                props.breadcrumb
                  ? props.breadcrumb.course.name
                  : props.chapter.name
              }
            />

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
                  <MdRawOff className="size-6" />
                ) : (
                  <MdRawOn className="size-6" />
                )}
              </ActionIcon>
            </div>
          </div>

          {props.breadcrumb ? (
            <div className="flex gap-1 flex-wrap items-center">
              <LinkButton
                className="p-0"
                onClick={() => {
                  push("/browse", {
                    path: [
                      props.breadcrumb!.course.id,
                      props.breadcrumb!.section.idx,
                      props.breadcrumb!.resource.idx,
                    ],
                  } satisfies BrowseParams)
                }}
              >
                {props.breadcrumb.resource.displayContent}
              </LinkButton>
              <MdArrowForward />
              <LinkButton
                className="p-0"
                onClick={() => {
                  push("/browse", {
                    path: [
                      props.breadcrumb!.course.id,
                      props.breadcrumb!.section.idx,
                      props.breadcrumb!.resource.idx,
                      props.chapter.id,
                    ],
                  } satisfies BrowseParams)
                }}
              >
                {props.chapter.name}
              </LinkButton>
            </div>
          ) : undefined}
        </div>

        <Divider />

        {raw ? (
          <div
            className="content select-text"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        ) : (
          <ChapterContent
            courseId={props.courseId}
            chapterName={props.chapter.name}
            sanitizedContent={content}
            openFile={(href) => {
              window.open(href)
              // setOpenedFile(href)
            }}
          />
        )}
      </Panel>
    </>
  )
}
