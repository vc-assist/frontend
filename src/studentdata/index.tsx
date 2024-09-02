import { type Data, GetDataRequest } from "@backend.sis/api_pb"
import { useQuery } from "@tanstack/react-query"
import { ErrorPage } from "@vcassist/ui"
import { useEffect } from "react"
import { useUser } from "../providers"
import { LoadingPage } from "./LoadingPage"

export function StudentDataLoadingPage(props: {
  onLoad(s: Data): void
}) {
  const { profile, sisClient } = useUser()

  const { isPending, error, data } = useQuery({
    queryKey: ["sis", "getData", profile.email],
    queryFn: () =>
      sisClient.getData(new GetDataRequest()).then((res) => {
        const data = res.data
        if (!data) {
          throw new Error("Student data is undefined.")
        }
        return data
      }),
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
