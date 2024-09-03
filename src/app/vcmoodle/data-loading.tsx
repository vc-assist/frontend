import { LoadingPage } from "@/src/components/LoadingPage"
import { useUser } from "@/src/providers"
import {
  GetCoursesRequest,
  type GetCoursesResponse,
} from "@backend.vcmoodle/api_pb"
import { useQuery } from "@tanstack/react-query"
import { ErrorPage } from "@vcassist/ui"
import { useEffect } from "react"
import { useVCMoodleClient } from "./providers"

export function VCMoodleDataLoadingPage(props: {
  onLoad(s: GetCoursesResponse): void
}) {
  const { profile } = useUser()
  const vcmoodleClient = useVCMoodleClient()

  const { isPending, error, data } = useQuery({
    queryKey: ["vcmoodle", "getData", profile.email],
    queryFn: () => vcmoodleClient.getCourses(new GetCoursesRequest()),
  })

  useEffect(() => {
    if (!data) {
      return
    }
    props.onLoad(data)
  }, [data, props.onLoad])

  if (isPending) {
    return <LoadingPage />
  }
  if (error) {
    return (
      <ErrorPage
        message="Failed to fetch student data."
        description={error.message}
      />
    )
  }
}
