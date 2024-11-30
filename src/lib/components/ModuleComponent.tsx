import { LoadingPage } from "@/src/lib/components/LoadingPage"
import { DataModulesAtom, type LoggedInUser } from "@/src/lib/stores"
import { ErrorPage } from "@/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { useCallback } from "react"
import { type Modules, pendingModules } from "../modules"
import { CredentialCarousel } from "./CredentialCarousel"

// XXX: There's got to be a more efficient, more granular way to do this
export function ModuleComponent(props: { user: LoggedInUser }) {
  const setDataModules = useSetAtom(DataModulesAtom)
  // Honestly the useQuery is probably unnecessary/overkill
  // but if it ain't broke don't fix it
  const moduleCredentialsQuery = useQuery({
    queryKey: ["moduleCredentials", props.user.token],
    queryFn: async () => {
      const output = await Promise.all(
        pendingModules.map((mod) => mod(props.user.token!)),
      )
      const newDataModules: Modules = output.reduce((acc, mod) => {
        const key = mod.name.toLowerCase() as Lowercase<typeof mod.name>
        // @ts-ignore No idea what easier way to do this
        acc[key] = mod
        return acc
      }, {} as Modules)
      setDataModules(newDataModules)
      return output
    },
  })
  const queryClient = useQueryClient()
  // Required to avoid infinite loop
  // XXX: I'm pretty sure this is a sign of bad code
  const onComplete = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ["moduleCredentials"] })
  }, [queryClient])

  if (!moduleCredentialsQuery.data) {
    return <LoadingPage />
  }
  if (!moduleCredentialsQuery.data?.every((value) => value.provided)) {
    return (
      <CredentialCarousel
        profile={props.user.profile}
        items={moduleCredentialsQuery.data}
        onComplete={onComplete}
      />
    )
  }
  if (moduleCredentialsQuery.isError) {
    // TODO: Log error
    return (
      <ErrorPage
        message="Failed to get credential status."
        description={moduleCredentialsQuery.error.message}
      />
    )
  }
}
