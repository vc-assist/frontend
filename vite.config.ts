import { join } from "node:path"
import react from "@vitejs/plugin-react-swc"
import * as vite from "vite"
import { loadConfig } from "./lib/config"

const config = loadConfig()

export default vite.defineConfig({
  resolve: {
    alias: {
      "@": __dirname,
      "@backend.auth": join(
        __dirname,
        "backend",
        "proto",
        "vcassist",
        "services",
        "auth",
        "v1",
      ),
      "@backend.studentdata": join(
        __dirname,
        "backend",
        "proto",
        "vcassist",
        "services",
        "studentdata",
        "v1",
      ),
    },
  },
  define: {
    __CONFIG__: JSON.stringify(config),
  },
  plugins: [react()],
})
