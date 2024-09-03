import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/carousel/styles.css"
import "@vcassist/ui/styles.css"

import { signal } from "@preact/signals-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Foundation, type SafeArea } from "@vcassist/ui/foundation"
import { StrictMode, lazy } from "react"
import ReactDOM from "react-dom/client"
import { MdAnalytics, MdPages } from "react-icons/md"
import { App, type AppModule } from "./app/App"
import { config, native } from "./singletons"

window.open = (url) => {
  if (!url) {
    return window
  }
  native.launchUrl(url?.toString())
  return window
}

const safeArea = signal<SafeArea>({
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
})

await native.onSafeAreaChange((insets) => {
  safeArea.value = insets
})

const FoundationProvider = Foundation({
  safeArea,
  telemetry: {
    serviceName: "frontend",
    otlp: {
      traces: {
        httpEndpoint: config.endpoints.traces.http_endpoint,
        headers: config.endpoints.traces.headers,
      },
      metrics: {
        httpEndpoint: config.endpoints.metrics.http_endpoint,
        headers: config.endpoints.metrics.headers,
      },
    },
  },
})

const queryClient = new QueryClient()

const root = document.getElementById("root")
if (!root) {
  throw new Error("could not find root element.")
}

const modules: AppModule[] = [
  {
    name: "School Information System",
    icon: MdAnalytics,
    render: lazy(() => import("./app/sis")),
    enabled: config.enabled_modules.sis,
  },
  {
    name: "Quick Moodle",
    icon: MdPages,
    render: lazy(() => import("./app/vcmoodle")),
    enabled: config.enabled_modules.vcmoodle,
  },
]

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FoundationProvider>
        <App modules={modules} />
      </FoundationProvider>
    </QueryClientProvider>
  </StrictMode>,
)
