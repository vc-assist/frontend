import "@vcassist/ui/global.css"

import ReactDOM from "react-dom/client"
import { StrictMode } from "react";
import { Foundation } from "@vcassist/ui/foundation"

const AppFoundation = Foundation({
  safeArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
})

const root = document.getElementById("root");
if (!root) {
  throw new Error("could not find root element.");
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <AppFoundation>
      aajajaj
    </AppFoundation>
  </StrictMode>
)

