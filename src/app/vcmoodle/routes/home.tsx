import type {
  Chapter,
  Course,
  Section,
  Resource,
} from "@backend.vcmoodle/api_pb"
import { ChapterDisplay } from "./chapter-content"
import { motion } from "framer-motion"
import { HighlightSearch } from "./highlight-search"

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
      {traces.map((trace, i) => {
        return (
          <motion.div
            key={trace.course.id}
            transition={{ delay: 0.05 * (i + 1) }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <ChapterDisplay
              courseId={Number(trace.course.id)}
              chapter={trace.chapter}
              breadcrumb={{
                course: trace.course,
                section: trace.section,
                resource: trace.resource,
              }}
            />
          </motion.div>
        )
      })}

      <HighlightSearch />
    </div>
  )
}
