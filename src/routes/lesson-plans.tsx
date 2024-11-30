import { ChapterDisplay } from "@/src/lib/components/ChapterDisplay"
import { LoadingPage } from "@/src/lib/components/LoadingPage"
import type {
  Chapter,
  Course,
  Resource,
  Section,
} from "@backend.vcmoodle/api_pb"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { useMoodleQuery } from "../lib/queries"

export const Route = createFileRoute("/lesson-plans")({
  component: HomeComponent,
})

function HomeComponent() {
  const moodleQuery = useMoodleQuery()
  if (moodleQuery.isLoading) return <LoadingPage />
  if (moodleQuery.isError) throw moodleQuery.error
  const { courses } = moodleQuery.data!

  const traces: {
    course: Course
    section: Section
    resource: Resource
    chapter: Chapter
  }[] = []

  for (const course of courses) {
    // if (!course.sections) continue;
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
    <div className="flex flex-wrap gap-5 max-w-full">
      {traces.map((trace, i) => {
        return (
          <motion.div
            key={trace.course.id}
            className="max-w-full"
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
              breadcrumbLinkToUrl
            />
          </motion.div>
        )
      })}

      {/* <HighlightSearch /> */}
    </div>
  )
}
