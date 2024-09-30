import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/carousel/styles.css"
import "@vcassist/ui/styles.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Foundation, useSafeArea } from "@vcassist/ui/foundation"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { App, type AppModule } from "./app/App"
import { config, native } from "./singletons"

window.open = (url) => {
  if (!url) {
    return window
  }
  native.launchUrl(url?.toString())
  return window
}

await native.onSafeAreaChange((insets) => {
  useSafeArea.setState({ insets })
})

const FoundationProvider = Foundation({
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

const modules: AppModule[] = []
if (config.enabled_modules.sis) {
  modules.push((await import("./app/sis/app")).sisModule)
}
if (config.enabled_modules.vcmoodle) {
  modules.push((await import("./app/vcmoodle/app")).vcmoodleModule)
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FoundationProvider>
        <App modules={modules} />
      </FoundationProvider>
    </QueryClientProvider>
  </StrictMode>,
)
