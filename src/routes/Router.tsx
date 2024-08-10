import { Title } from "@mantine/core"
import {
  LinkButton,
  NavbarList,
  Panel,
  UserAvatar,
  type UserProfile,
  context,
  useLayout,
  useSafeArea,
} from "@vcassist/ui"
import type { SafeArea } from "@vcassist/ui/foundation/safe-area"
import { ErrorPage } from "@vcassist/ui"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import type { IconType } from "react-icons"
import { MdPerson, MdSettings } from "react-icons/md"
import { twMerge } from "tailwind-merge"

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
  profile: UserProfile
}
const [RouteProvider, useRouteContext] = context<RouteContext>({
  currentRoute: "",
  profile: { email: "" },
})
export { useRouteContext }

const PROFILE_ROUTE_PATH = "/__profile__"

export function Router(props: {
  routes: Record<string, Route>
  profileRoute: {
    rootClassName?: string
    render(): JSX.Element
  }
  defaultRoute: string
  profile: UserProfile
}) {
  const safeArea = useSafeArea()
  const mobile = useLayout() === "mobile"

  const [routePath, setRoutePath] = useState(props.defaultRoute)

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

  if (!route) {
    return (
      <ErrorPage message="Oh no! You're lost.'">
        <LinkButton
          onClick={() => {
            setRoutePath(props.defaultRoute)
          }}
        >
          Return to the dashboard
        </LinkButton>
      </ErrorPage>
    )
  }

  const component = (
    <ComponentWrapper className={route.rootClassName}>
      {route.render()}
    </ComponentWrapper>
  )

  if (mobile) {
    return (
      <RouteProvider
        value={{ currentRoute: routePath, profile: props.profile }}
      >
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
              onNavigate={setRoutePath}
            />
          }
        />
        {component}
      </RouteProvider>
    )
  }

  return (
    <RouteProvider value={{ currentRoute: routePath, profile: props.profile }}>
      <DesktopLayout
        profile={props.profile}
        safeArea={safeArea}
        component={component}
        navbar={
          <NavbarList
            route={routePath}
            layout="desktop"
            routes={navbarItems}
            onNavigate={setRoutePath}
          />
        }
        belowProfile={
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
            onClick={() => setRoutePath(PROFILE_ROUTE_PATH)}
          >
            <MdSettings className="size-6" />
          </button>
        }
      />
    </RouteProvider>
  )
}

function ComponentWrapper(props: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      className={twMerge("w-full h-fit mb-auto", props.className)}
      initial={{ y: 20, opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0.5 }}
    >
      {props.children}
    </motion.div>
  )
}

function MobileLayout(props: {
  safeArea: SafeArea
  component: React.ReactNode
  navbar: React.ReactNode
}) {
  const { safeArea, component, navbar } = props
  return (
    <div className="w-full h-full">
      <div
        className="h-full flex flex-col gap-6 p-6 overflow-y-auto"
        style={{
          paddingTop: `calc(1.5rem + ${safeArea.top}px)`,
          paddingLeft: `calc(1.5rem + ${safeArea.left}px)`,
          paddingRight: `calc(1.5rem + ${safeArea.right}px)`,
          paddingBottom: `calc(1.5rem + ${safeArea.bottom}px)`,
        }}
      >
        <AnimatePresence>{component}</AnimatePresence>
        {/* Routes */}
        <div className="flex flex-col gap-4 sticky bottom-0 z-50">
          <div className="flex gap-4">{navbar}</div>
        </div>
      </div>
      <div
        className={twMerge(
          "absolute bottom-0 backdrop-blur-lg w-full z-40",
          "transition-all duration-500 pointer-events-none",
        )}
        style={{ mask: "linear-gradient(transparent, black 50%)" }}
      />
    </div>
  )
}

function DesktopLayout(props: {
  profile: UserProfile
  safeArea: SafeArea
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
              <img src="/favicon.svg" alt="brand" width={36} height={36} />
              <Title className="font-black whitespace-nowrap" order={3}>
                VC Assist
              </Title>
            </Panel>
            {/* Routes */}
            {navbar}
            {/* Profile */}
            <Panel className="flex gap-2 items-center">
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
              <div className="flex items-center gap-3">{belowProfile}</div>
            </Panel>
          </div>
        </div>
        <AnimatePresence>{component}</AnimatePresence>
      </div>
    </div>
  )
}
