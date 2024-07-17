import "@mantine/core/styles.css"
import "@vcassist/ui/styles.css"

import { Foundation } from "@vcassist/ui/foundation"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "./singletons"
import { App } from "./App"

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
