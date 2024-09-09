import type {
  Chapter,
  Course,
  Section,
  Resource,
} from "@backend.vcmoodle/api_pb"
import { ChapterDisplay } from "./chapter-content"

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
        return (
          <ChapterDisplay
            key={trace.course.id}
            chapter={trace.chapter}
            breadcrumb={{
              course: trace.course,
              section: trace.section,
              resource: trace.resource,
            }}
          />
        )
      })}
    </div>
  )
}
