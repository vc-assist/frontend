import "@mantine/core/styles.css"
import "@vcassist/ui/styles.css"

import { Foundation } from "@vcassist/ui/foundation"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { config } from "./config"

const AppFoundation = Foundation({
  safeArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  telemetry: {
    serviceName: "frontend",
    otlp: {
      tracesHttpEndpoint: config.traces_otlp_http_endpoint,
      metricsHttpEndpoint: config.metrics_otlp_http_endpoint,
    },
  },
})

const root = document.getElementById("root")
if (!root) {
  throw new Error("could not find root element.")
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <AppFoundation />
  </StrictMode>,
)
