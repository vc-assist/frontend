import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@vcassist/ui/styles.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Foundation } from "@vcassist/ui/foundation"
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

const FoundationProvider = Foundation({
  safeArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  telemetry: {
    serviceName: "frontend",
    otlp: {
      tracesHttpEndpoint: config.endpoints.traces_otlp_http,
      metricsHttpEndpoint: config.endpoints.metrics_otlp_http,
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
