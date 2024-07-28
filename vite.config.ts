import { join } from "node:path"
import react from "@vitejs/plugin-react-swc"
import * as vite from "vite"
import { loadConfig } from "./lib/config"

const config = loadConfig()

export default vite.defineConfig({
  build: {
    target: [
      "chrome89",
      "edge89",
      "safari15",
      "firefox89",
    ],
    rollupOptions: {
      external: [
        "/native_api.js"
      ]
    },
    // 5 MB chunk warning
    chunkSizeWarningLimit: 5000,
  },
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
