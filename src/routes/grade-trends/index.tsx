import type { Course } from "@backend.studentdata/student_data_pb"
import { createDefaultMeter } from "@vcassist/ui"
import { useEffect } from "react"
import GradeTrendsComponent from "./GradeTrends"

const meter = createDefaultMeter("routes.grades")
const viewPage = meter.createCounter("view")

export default function GradeTrends({ courses }: { courses: Course[] }) {
  useEffect(() => {
    viewPage.add(1)
  }, [])
  return <GradeTrendsComponent courses={courses} />
}
