import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/carousel/styles.css"
import "@vcassist/ui/styles.css"
import "./main.css"
import vcassistConfig from "@/vcassist.config"
import { Foundation } from "@vcassist/ui"
import { useAtomValue } from "jotai"
import LoginComponent from "./lib/components/LoginComponent"
import { ModuleComponent } from "./lib/components/ModuleComponent"
import { DataModulesLoaded, UserAtom } from "./lib/stores"

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {},
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()
const FoundationProvider = Foundation({
  telemetry: {
    serviceName: "frontend",
    otlp: vcassistConfig.endpoints,
  },
})
function App() {
  const user = useAtomValue(UserAtom)
  const dataModulesLoaded = useAtomValue(DataModulesLoaded)
  // Don't use TanStack router's authenticated routes or whatever
  // to handle auth, I already tried that.
  // This code which bypasses the auth/router context code from TanStack Router
  // is SIGNIFICANTLY simpler and easier to understand.
  // - ThatXliner
  if (!user?.token) {
    return (
      <React.StrictMode>
        <FoundationProvider>
          <QueryClientProvider client={queryClient}>
            <LoginComponent />
          </QueryClientProvider>
        </FoundationProvider>
      </React.StrictMode>
    )
  }
  // While yes I could've made the `index.tsx` just have whatever
  // is in the ModuleComponent and then return when authenticated a <Navigate>
  // to say `_app/dashboard` (_app means it won't be part of
  // the actual URL and is only separated into a folder for
  // developer's sake), I decided to keep it like this
  // because this is less code and I had no idea
  // https://tanstack.com/router/latest/docs/framework/react/guide/navigation#navigate-component
  // existed when I first wrote this code.
  // Feel free to experiment though.
  // - ThatXliner
  if (!dataModulesLoaded) {
    return (
      <React.StrictMode>
        <FoundationProvider>
          <QueryClientProvider client={queryClient}>
            <ModuleComponent user={user} />
          </QueryClientProvider>
        </FoundationProvider>
      </React.StrictMode>
    )
  }
  return (
    <React.StrictMode>
      <FoundationProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} context={{ user }} />
        </QueryClientProvider>
      </FoundationProvider>
    </React.StrictMode>
  )
}

// Mounting

const rootElement = document.getElementById("app")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}
