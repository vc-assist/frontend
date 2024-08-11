import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@vcassist/ui/styles.css"

import { signal } from "@preact/signals-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Foundation, type SafeArea } from "@vcassist/ui/foundation"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import { config, native } from "./singletons"

window.open = (url) => {
  if (!url) {
    return window
  }
  native.launchUrl(url?.toString())
  return window
}

const root = document.getElementById("root")
if (!root) {
  throw new Error("could not find root element.")
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

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FoundationProvider>
        <App />
      </FoundationProvider>
    </QueryClientProvider>
  </StrictMode>,
)
