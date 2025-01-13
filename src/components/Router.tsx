//this file puts everything together in the frotend 
//authored by Shengzhi Hu and Justin Shi CO 2025
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

import { NavButton } from "@/src/lib/components/NavButton"
import { routes } from "@/vcassist.config"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { MdPerson, MdRefresh, MdSettings } from "react-icons/md"
import { Moodle, Powerschool } from "../lib/modules"
import { useState } from "react"
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



const allPowerschoolPaths = ["/grades-calculator", "/grades-trends", "/"]
const allMoodlePaths = ["/lesson-plans"]

const PROFILE_ROUTE_PATH = "/profile"

function BoilerplateComponents(props: {routePath : string}){

  const match = useMatch({ from: props.routePath }) //son of a bitch
  const mobile = useLayout() === "mobile"
  const safeArea = useSafeArea((area) => area.insets)

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

  const queryClient = useQueryClient()

  //worry about this later, case into SIS and Moodle
  const RefreshButton = (props: { className?: string }) => (
    <Button
      className={props.className}
      variant="subtle"
      leftSection={<MdRefresh className="size-5" />}
      loading={false}
      onClick={() => {
        // TODO: only refresh the current module
     
      }}
    >
      Refresh Data
    </Button>
  )

  //why bryan why 
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
        props.routePath === PROFILE_ROUTE_PATH
          ? "hover:text-dimmed hover:cursor-default bg-bg-dimmed"
          : "",
      )}
      disabled={props.routePath === PROFILE_ROUTE_PATH}
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
              route={props.routePath}
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
            props.routePath !== PROFILE_ROUTE_PATH ? (
              <div className="flex">
                <RefreshButton className="m-auto rounded-xl bg-bg shadow-xl border border-solid border-dimmed-subtle" />
              </div>
            ) : undefined
          }
        />
      ) : (
        <DesktopLayout
          profile={{email: "bobjones1234@gmail.com", name: "mynamejeff", picture: undefined}}
          safeArea={safeArea}
          component={component}
          navbar={
            <NavbarList
              route={props.routePath}
              layout="desktop"
              routes={navbarItems}
            />
          }
          belowProfile={
            <div className="flex gap-3 justify-between">
              {props.routePath !== PROFILE_ROUTE_PATH ? <RefreshButton /> : <div />}
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
function RootComponent() {
  const routePath = useLocation().pathname as string
  //const profile = useAtomValue(UserAtom).profile!
  const [powerschoolState, setPowerschoolState] = useState(false)
  const [moodleState, setMoodleState] = useState(false);



  if(allPowerschoolPaths.includes(routePath) ){ //powerschool route
    if(Powerschool.isLoggedIn()){
      return (
        
      )
    } else{
      return <Powerschool.render onDone = {() => {
        setPowerschoolState(true)
      }}>
      </Powerschool.render>
    }
  }

  if(allMoodlePaths.includes(routePath)){
    if(Moodle.isLoggedIn()){
      return(

      )
    } else {
      return <Moodle.render onDone = {() => {
        setMoodleState(true)
      }}></Moodle.render>
    }
  }
  
}
export type NavbarRoute = {
  title: string
  icon: IconType
  route: string
}
function NavbarList(props: {
  route: string
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
