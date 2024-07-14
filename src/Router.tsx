import { Title } from "@mantine/core";
import type { Signal } from "@preact/signals-react";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext } from "react";
import type { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";
import { useSignals } from "@preact/signals-react/runtime";
import { LinkButton, NavbarList, Panel, UserAvatar, useSafeArea, useLayout } from "@vcassist/ui"

export type NavbarRoute<P> = {
  title: string;
  render: (props: P) => JSX.Element;
  icon: IconType;
};

export type HeadlessRoute<P> = {
  title: string;
  render: (props: P) => JSX.Element;
};

export type RouterOptions<P> = {
  appName: string;
  userProfile: React.ComponentProps<typeof UserAvatar>;
  route: Signal<string>;
  headlessRoutes?: Record<string, HeadlessRoute<P>>;
  navbarRoutes: Record<string, NavbarRoute<P>>;
  defaultRoute: string;
  slots?: Partial<{
    profileOperations: () => JSX.Element;
  }>;
  props: P;
};

const RouterContext = createContext<RouterOptions<unknown> | undefined>(
  undefined,
);

export function useRouterContext<P>(): RouterOptions<P> {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error(
      "useRouterContext() must be called in a child component of <Router>",
    );
  }
  return ctx as RouterOptions<P>;
}

export function Router<P>(options: RouterOptions<P>) {
  useSignals();

  const route = options.route;

  const RouteSlot =
    options.navbarRoutes[route.value]?.render ??
    options.headlessRoutes?.[route.value]?.render;

  if (!RouteSlot) {
    return (
      <div className="flex h-full">
        <div className="m-auto">
          <p>Oh no! You're lost.</p>
          <LinkButton
            onClick={() => {
              route.value = options.defaultRoute;
            }}
          >
            Return to the dashboard
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <RouterContext.Provider value={options as RouterOptions<unknown>}>
      <RouteSlot {...(options.props as any)} />
    </RouterContext.Provider>
  );
}

function RouteLayout(props: { className?: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        className={twMerge("w-full h-fit mb-auto", props.className)}
        initial={{ y: 20, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0.5 }}
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Root component for all routes.
 */
export function Route(props: {
  className?: string;
  children: React.ReactNode;
}) {
  useSignals();

  const safeArea = useSafeArea();
  const mobile = useLayout() === "mobile";
  const { appName, userProfile, route, navbarRoutes, slots } =
    useRouterContext();

  const navbarItems: {
    title: string;
    icon: IconType;
    route: string;
  }[] = [];
  for (const path in navbarRoutes) {
    const route = navbarRoutes[path];
    navbarItems.push({
      title: route.title,
      icon: route.icon,
      route: path,
    });
  }

  if (mobile) {
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
          <RouteLayout className={props.className}>
            {props.children}
          </RouteLayout>
          {/* Routes */}
          <div className="flex flex-col gap-4 sticky bottom-0 z-50">
            <div className="flex gap-4">
              <NavbarList
                route={route.value}
                routes={navbarItems}
                layout="mobile"
                onNavigate={(r) => {
                  route.value = r;
                }}
              />
            </div>
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
    );
  }

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
                {appName}
              </Title>
            </Panel>
            {/* Routes */}
            <NavbarList
              route={route.value}
              layout="desktop"
              routes={navbarItems}
              onNavigate={(r) => {
                route.value = r;
              }}
            />
            {/* Profile */}
            <Panel className="flex gap-2 items-center">
              <UserAvatar {...userProfile} />
              <Title
                order={5}
                c="dimmed"
                className={twMerge(
                  "flex-1 text-left max-w-[110px]",
                  "overflow-ellipsis overflow-hidden",
                )}
              >
                {userProfile.name ?? userProfile.email}
              </Title>
              <div className="flex items-center gap-3">
                {slots?.profileOperations?.()}
              </div>
            </Panel>
          </div>
        </div>
        <RouteLayout className={props.className}>{props.children}</RouteLayout>
      </div>
    </div>
  );
}
