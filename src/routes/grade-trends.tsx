import { createFileRoute } from "@tanstack/react-router"
import { ErrorPage, createDefaultMeter } from "@vcassist/ui"

import { LoadingPage } from "@/src/lib/components/LoadingPage"
import { usePowerSchoolQuery } from "@/src/lib/queries"
import { useEffect } from "react"
import GradeTrendsComponent from "../lib/GradeTrends"

export const Route = createFileRoute("/grade-trends")({
  component: GradeTrends,
  // context: { rootClassName: "arsta" },
})
const meter = createDefaultMeter("routes.grades")
const viewPage = meter.createCounter("view")
function GradeTrends() {
  const powerschoolQuery = usePowerSchoolQuery()!
  useEffect(() => {
    viewPage.add(1)
  }, [])
  if (powerschoolQuery.isLoading) return <LoadingPage />
  if (powerschoolQuery.isError) return <ErrorPage />

  const { courses } = powerschoolQuery.data!

  return <GradeTrendsComponent courses={courses} />
}
