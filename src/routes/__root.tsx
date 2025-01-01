import { Button, Title } from "@mantine/core"
import {
  // ErrorPage,
  Favicon,
  type SafeAreaInsets,
  useLayout,
  useSafeArea,
} from "@vcassist/ui"
import { Panel, UserAvatar, type UserProfile } from "@vcassist/ui"
import { AnimatePresence, motion } from "framer-motion"
import { twMerge } from "tailwind-merge"

import { notifications } from "@mantine/notifications"
import {
  type FileRoutesByPath,
  Link,
  Outlet,
  createRootRoute,
  useLocation,
  useMatch,
} from "@tanstack/react-router"
import * as React from "react"
import type { IconType } from "react-icons"

import { NavButton } from "@/src/lib/components/NavButton"
import { DataModulesAtom, UserAtom } from "@/src/lib/stores"
import { routes } from "@/vcassist.config"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { MdPerson, MdRefresh, MdSettings } from "react-icons/md"
// interface RootContext {
// 	rootClassName?: string;
// }
export const Route = createRootRoute({
  component: RootComponent,
  // errorComponent: (props) => (
  //   <ErrorPage
  //     message={props.error.message}
  //     description={props.info?.componentStack}
  //   />
  // ),
})

const PROFILE_ROUTE_PATH = "/profile"
function RootComponent() {
  const safeArea = useSafeArea((area) => area.insets)
  const mobile = useLayout() === "mobile"
  const routePath = useLocation().pathname as keyof FileRoutesByPath
  const profile = useAtomValue(UserAtom).profile!
  const match = useMatch({ from: routePath })

  const navbarItems: {
    title: string
    icon: IconType
    route: keyof FileRoutesByPath
  }[] = []

  for (const [path, route] of Object.entries(routes)) {
    if (route.noNavbar) {
      continue
    }
    navbarItems.push({
      title: route.title,
      icon: route.icon,
      route: path as keyof FileRoutesByPath,
    })
  }

  const dataModules = useAtomValue(DataModulesAtom)
  const queryClient = useQueryClient()
  const refreshMutation = useMutation({
    mutationFn: async () => {
      return Object.entries(dataModules ?? {}).map(([name, module]) => {
        module.refetch()
        return name
      })
    },
    onError(err) {
      notifications.show({
        title: "Failed to refresh data.",
        message: err.message,
        color: "red",
        autoClose: 10000,
      })
    },
    async onSuccess(data) {
      await Promise.all(
        data.map((name) => queryClient.invalidateQueries({ queryKey: [name] })),
      )
      notifications.show({
        message: "Successfully refreshed data.",
        color: "green",
        autoClose: 3000,
      })
    },
  })

  const RefreshButton = (props: { className?: string }) => (
    <Button
      className={props.className}
      variant="subtle"
      leftSection={<MdRefresh className="size-5" />}
      loading={refreshMutation.isPending}
      onClick={() => {
        // TODO: only refresh the current module
        refreshMutation.mutate()
      }}
    >
      Refresh Data
    </Button>
  )

  const TanStackRouterDevtools = import.meta.env.PROD
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      )

  const settingsButton = (
    <Link
      to={PROFILE_ROUTE_PATH}
      type="button"
      className={twMerge(
        "p-1 text-dimmed hover:text-primary transition-all rounded-lg",
        routePath === PROFILE_ROUTE_PATH
          ? "hover:text-dimmed hover:cursor-default bg-bg-dimmed"
          : "",
      )}
      disabled={routePath === PROFILE_ROUTE_PATH}
      color="gray"
    >
      <MdSettings className="size-6" />
    </Link>
  )
  const component = (
    <motion.div
      className={twMerge("w-full h-fit mb-auto", match?.staticData?.className)}
      initial={{ y: 20, opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <Outlet />
    </motion.div>
  )

  return (
    <main className="h-screen">
      {mobile ? (
        <MobileLayout
          safeArea={safeArea}
          component={component}
          navbar={
            <NavbarList
              route={routePath}
              routes={[
                ...navbarItems,
                {
                  title: "Profile",
                  icon: MdPerson,
                  route: PROFILE_ROUTE_PATH,
                },
              ]}
              layout="mobile"
            />
          }
          aboveNavbar={
            routePath !== PROFILE_ROUTE_PATH ? (
              <div className="flex">
                <RefreshButton className="m-auto rounded-xl bg-bg shadow-xl border border-solid border-dimmed-subtle" />
              </div>
            ) : undefined
          }
        />
      ) : (
        <DesktopLayout
          profile={profile}
          safeArea={safeArea}
          component={component}
          navbar={
            <NavbarList
              route={routePath}
              layout="desktop"
              routes={navbarItems}
            />
          }
          belowProfile={
            <div className="flex gap-3 justify-between">
              {routePath !== PROFILE_ROUTE_PATH ? <RefreshButton /> : <div />}
              {settingsButton}
            </div>
          }
        />
      )}
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </main>
  )
}
export type NavbarRoute = {
  title: string
  icon: IconType
  route: keyof FileRoutesByPath
}
function NavbarList(props: {
  route: keyof FileRoutesByPath
  routes: NavbarRoute[]
  layout: "mobile" | "desktop"
}) {
  if (props.layout === "mobile") {
    return (
      <Panel className="m-auto overflow-x-auto" noPadding>
        <div className="max-w-min flex flex-1 p-2">
          {props.routes.map(({ route, icon }) => {
            return (
              <NavButton
                key={route}
                routeSelected={props.route === route}
                icon={icon}
                route={route}
              />
            )
          })}
        </div>
      </Panel>
    )
  }

  return (
    <Panel
      className="flex flex-col flex-1 overflow-y-auto p-2 whitespace-nowrap"
      noPadding
    >
      {props.routes.map(({ title, route, icon }) => {
        return (
          <NavButton
            key={route}
            icon={icon}
            label={title}
            routeSelected={props.route === route}
            route={route}
          />
        )
      })}
    </Panel>
  )
}

function MobileLayout(props: {
  safeArea: SafeAreaInsets
  component: React.ReactNode
  navbar: React.ReactNode
  aboveNavbar?: React.ReactNode
}) {
  const { safeArea, component, navbar } = props
  return (
    <div className="w-full h-full">
      <div
        className="h-full flex flex-col gap-6 p-6 overflow-y-auto overflow-x-hidden"
        style={{
          paddingTop: `calc(1.5rem + ${safeArea.top}px)`,
          paddingLeft: `calc(1.5rem + ${safeArea.left}px)`,
          paddingRight: `calc(1.5rem + ${safeArea.right}px)`,
          paddingBottom: `calc(1.5rem + ${safeArea.bottom}px)`,
        }}
      >
        <AnimatePresence>{component}</AnimatePresence>
        {/* Routes */}
        <div className="flex flex-col gap-2 z-50 sticky bottom-0">
          {props.aboveNavbar}
          <div className="flex gap-4">{navbar}</div>
        </div>
      </div>
      <div
        className={twMerge(
          "absolute bottom-0 backdrop-blur-lg w-full z-40 h-[160px]",
          "transition-all duration-500 pointer-events-none",
        )}
        style={{ mask: "linear-gradient(transparent, black 50%)" }}
      />
    </div>
  )
}

function DesktopLayout(props: {
  profile: UserProfile
  safeArea: SafeAreaInsets
  component: React.ReactNode
  navbar: React.ReactNode
  belowProfile: React.ReactNode
}) {
  const { safeArea, component, navbar, profile, belowProfile } = props

  return (
    <div
      className="flex h-full"
      style={{
        paddingTop: `${safeArea.top}px`,
        paddingLeft: `${safeArea.left}px`,
        paddingBottom: `${safeArea.bottom}px`,
        paddingRight: `${safeArea.right}px`,
      }}
    >
      <div
        className="w-full h-full p-6 flex gap-6 overflow-y-auto m-auto"
        style={{
          maxWidth: "calc(100vh * 16 / 9)",
        }}
      >
        <div className="sticky top-0 h-full transition-all">
          <div className="flex flex-col gap-6 min-w-[200px]">
            {/* Branding */}
            <Panel className="flex gap-3 items-center">
              <Favicon className="w-[36px] h-[36]px" />
              <Title className="font-black whitespace-nowrap" order={3}>
                VC Assist
              </Title>
            </Panel>
            {/* Routes */}
            {navbar}
            {/* Profile */}
            <Panel className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <UserAvatar {...profile} />
                <Title
                  order={5}
                  c="dimmed"
                  className={twMerge(
                    "flex-1 text-left max-w-[110px]",
                    "overflow-ellipsis overflow-hidden",
                  )}
                >
                  {profile.name ?? profile.email}
                </Title>
              </div>
              {belowProfile}
            </Panel>
          </div>
        </div>
        <AnimatePresence>{component}</AnimatePresence>
      </div>
    </div>
  )
}
