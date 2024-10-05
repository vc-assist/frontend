import { join } from "node:path"
import react from "@vitejs/plugin-react"
import * as vite from "vite"
import { loadConfig } from "./lib/config"

const config = loadConfig()

export default vite.defineConfig((env) => ({
  base: "./",
  build: {
    target: ["chrome89", "edge89", "safari15", "firefox89"],
    // 5 MB chunk warning
    chunkSizeWarningLimit: 5000,
    sourcemap: env.mode === "development" ? "inline" : undefined,
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
      "@backend.sis": join(
        __dirname,
        "backend",
        "proto",
        "vcassist",
        "services",
        "sis",
        "v1",
      ),
      "@backend.vcmoodle": join(
        __dirname,
        "backend",
        "proto",
        "vcassist",
        "services",
        "vcmoodle",
        "v1",
      ),
    },
  },
  define: {
    __CONFIG__: JSON.stringify(config),
  },
  plugins: [
    env.mode === "development"
      ? {
          name: "resolve-native-api",
          resolveId(id) {
            if (id === "native_api.js") {
              return "\0" + "virtual:native_api"
            }
          },
          load(id) {
            if (id === "\0" + "virtual:native_api") {
              return "undefined"
            }
          },
        }
      : undefined,
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler", {}]
      }
    }),
  ],
}))
