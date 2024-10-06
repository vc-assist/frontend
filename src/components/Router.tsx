import { Button, Title } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"
import { Favicon, type SafeAreaInsets } from "@vcassist/ui"
import {
  NavbarList,
  Panel,
  UserAvatar,
  type UserProfile,
  useLayout,
  useSafeArea,
} from "@vcassist/ui"
import { AnimatePresence, motion } from "framer-motion"
import type { IconType } from "react-icons"
import { MdPerson, MdRefresh, MdSettings } from "react-icons/md"
import { twMerge } from "tailwind-merge"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Route =
  | {
    title: string
    icon: IconType
    rootClassName?: string
    render(): JSX.Element
  }
  | {
    title: string
    noNavbar: true
    rootClassName?: string
    render(): JSX.Element
  }

export type RouteContext = {
  currentRoute: string
  params?: unknown
  push(path: string, params?: unknown): void
}

export const useRouteContext = create(
  persist<RouteContext>(
    (set): RouteContext => ({
      currentRoute: "",
      params: undefined,
      push: (path, params) => {
        set({ currentRoute: path, params })
      },
    }),
    {
      name: "route",
      partialize(state) {
        return { currentRoute: state.currentRoute } as RouteContext
      },
    },
  ),
)

const PROFILE_ROUTE_PATH = "/__profile__"

export function Router(props: {
  routes: Record<string, Route>
  profileRoute: {
    rootClassName?: string
    render(): JSX.Element
  }
  defaultRoute: string
  profile: UserProfile
  onRefresh(route: string): Promise<void>
}) {
  const safeArea = useSafeArea((area) => area.insets)
  const mobile = useLayout() === "mobile"

  const routePath = useRouteContext((ctx) => {
    if (!props.routes[ctx.currentRoute] && ctx.currentRoute !== PROFILE_ROUTE_PATH) {
      return props.defaultRoute
    }
    return ctx.currentRoute
  })
  const push = useRouteContext((ctx) => ctx.push)

  const navbarItems: {
    title: string
    icon: IconType
    route: string
  }[] = []
  for (const [path, route] of Object.entries(props.routes)) {
    if ("noNavbar" in route) {
      continue
    }
    navbarItems.push({
      title: route.title,
      icon: route.icon,
      route: path,
    })
  }

  const route =
    routePath === PROFILE_ROUTE_PATH
      ? props.profileRoute
      : props.routes[routePath]

  const component = (
    <RouteWrapper
      key={routePath}
      className={route.rootClassName}
      render={route.render}
    />
  )

  const refreshMutation = useMutation({
    mutationFn: props.onRefresh,
    onError(err) {
      notifications.show({
        title: "Failed to refresh data.",
        message: err.message,
        color: "red",
        autoClose: 10000,
      })
    },
    onSuccess() {
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
        refreshMutation.mutate(routePath)
      }}
    >
      Refresh Data
    </Button>
  )

  if (mobile) {
    return (
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
            onNavigate={push}
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
    )
  }

  const settingsButton = (
    <button
      type="button"
      className={twMerge(
        "p-1 text-dimmed hover:text-primary transition-all rounded-lg",
        routePath === PROFILE_ROUTE_PATH
          ? "hover:text-dimmed hover:cursor-default bg-bg-dimmed"
          : "",
      )}
      disabled={routePath === PROFILE_ROUTE_PATH}
      color="gray"
      onClick={() => push(PROFILE_ROUTE_PATH)}
    >
      <MdSettings className="size-6" />
    </button>
  )

  return (
    <DesktopLayout
      profile={props.profile}
      safeArea={safeArea}
      component={component}
      navbar={
        <NavbarList
          route={routePath}
          layout="desktop"
          routes={navbarItems}
          onNavigate={push}
        />
      }
      belowProfile={
        <div className="flex gap-3 justify-between">
          {routePath !== PROFILE_ROUTE_PATH ? <RefreshButton /> : <div />}
          {settingsButton}
        </div>
      }
    />
  )
}

function RouteWrapper(props: {
  className?: string
  render: () => JSX.Element
}) {
  return (
    <motion.div
      className={twMerge("w-full h-fit mb-auto", props.className)}
      initial={{ y: 20, opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <props.render />
    </motion.div>
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
        <div className="flex flex-col gap-2 sticky bottom-0 z-50">
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
