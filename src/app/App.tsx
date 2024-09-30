import { LoginPage } from "@/src/components/Auth"
import { useQuery } from "@tanstack/react-query"
import {
  CredentialCarousel,
  type CredentialState,
  ErrorPage,
  IconButton,
  Positioned,
} from "@vcassist/ui"
import { MdArrowBack } from "react-icons/md"
import { LoadingPage } from "../components/LoadingPage"
import { type Route, Router } from "../components/Router"
import Profile from "../components/profile"
import { useToken, useUser } from "../stores"

export type AppModuleCredentialsProvided = {
  routes: Record<string, Route>
}
export type AppModuleLoggedIn = {
  credentialStates: CredentialState[]
  afterCredentialsProvided(): Promise<AppModuleCredentialsProvided>
}
export type AppModule = {
  afterLogin(token: string): Promise<AppModuleLoggedIn>
}

export function App(props: {
  modules: AppModule[]
}) {
  const tokenValue = useToken((token) => token.token)
  const profile = useUser((state) => state.profile)

  const credentialStatesQuery = useQuery({
    queryKey: ["credentialStates", tokenValue],
    queryFn: () => {
      return Promise.all(props.modules.map((mod) => mod.afterLogin(tokenValue!)))
    },
    enabled: !!tokenValue,
  })

  const routesQuery = useQuery({
    queryKey: ["loginRoutes", tokenValue],
    queryFn: () => {
      return Promise.all(
        credentialStatesQuery.data!.map((mod) => mod.afterCredentialsProvided()),
      )
    },
    enabled: !!credentialStatesQuery.data
  })

  if (!profile) {
    return (
      <LoginPage
        token={tokenValue}
        onLogin={(newToken, profile) => {
          useToken.setState({ token: newToken })
          useUser.setState({ profile })
        }}
        onInvalidToken={() => {
          useUser.getState().logout()
        }}
      />
    )
  }

  if (credentialStatesQuery.isError) {
    return (
      <ErrorPage
        message="Failed to get credential status."
        description={credentialStatesQuery.error.message}
      />
    )
  }
  if (!credentialStatesQuery.data) {
    return <LoadingPage />
  }

  let complete = true
  const credentialStates: CredentialState[] = []
  for (const mod of credentialStatesQuery.data) {
    for (const state of mod.credentialStates) {
      if (!state.provided) {
        complete = false
      }
      credentialStates.push(state)
    }
  }
  if (!complete) {
    return (
      <div className="flex w-full h-full">
        <CredentialCarousel
          profile={profile}
          credentials={credentialStates}
          onComplete={() => {
            credentialStatesQuery.refetch()
          }}
        />
        <Positioned x="left" y="top" padding="2rem">
          <IconButton
            icon={MdArrowBack}
            label="Back"
            color="dark"
            horizontal
            onClick={open}
          />
        </Positioned>
      </div>
    )
  }

  if (routesQuery.isError) {
    return (
      <ErrorPage
        message="Failed to fetch data."
        description={routesQuery.error.message}
      />
    )
  }
  if (!routesQuery.data) {
    return <LoadingPage />
  }

  const allRoutes: Record<string, Route> = {}
  for (const mod of routesQuery.data) {
    Object.assign(allRoutes, mod.routes)
  }

  return (
    <Router
      profile={profile}
      routes={allRoutes}
      defaultRoute={Object.keys(allRoutes)[0]}
      profileRoute={{
        render() {
          return <Profile profile={profile} />
        },
      }}
    />
  )
}
