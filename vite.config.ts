import react from "@vitejs/plugin-react-swc";
import * as vite from "vite"
import { loadConfig } from "./lib/config"
import { join } from "node:path"

const config = loadConfig()

export default vite.defineConfig({
  resolve: {
    alias: {
      "@": __dirname,
      "@backend.studentdata": join(__dirname, "backend", "services", "studentdata", "api")
    },
  },
  define: {
    __CONFIG__: JSON.stringify(config)
  },
  plugins: [react()]
})
