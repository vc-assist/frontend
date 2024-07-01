import { ErrorBoundary, UIProvider, initTelemetry } from "./foundation"
import ReactDOM from "react-dom/client"
import { StrictMode } from "react";

initTelemetry()

const root = document.getElementById("root");
if (!root) {
  throw new Error("could not find root element.");
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <UIProvider>
      <ErrorBoundary>
        aajajaj
      </ErrorBoundary>
    </UIProvider>
  </StrictMode>
)

