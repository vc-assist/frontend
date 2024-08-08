import { join } from "node:path"
import react from "@vitejs/plugin-react-swc"
import * as vite from "vite"
import { loadConfig } from "./lib/config"

const config = loadConfig()

export default vite.defineConfig((env) => ({
  base: "./",
  build: {
    target: ["chrome89", "edge89", "safari15", "firefox89"],
    rollupOptions: {
      external: ["/native_api.js"],
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
  plugins: [
    env.mode === "development" ? {
      name: "resolve-native-api",
      resolveId(id) {
        if (id === "/native_api.js") {
          return "\0" + "virtual:native_api.js"
        }
      },
      load(id) {
        if (id === "\0" + "virtual:native_api.js") {
          return "undefined"
        }
      },
    } : undefined,
    react(),
  ],
}))
