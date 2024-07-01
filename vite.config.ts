import react from "@vitejs/plugin-react-swc";
import * as vite from "vite"
import { loadConfig } from "./lib/config"

const config = loadConfig()

export default vite.defineConfig({
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  define: {
    __CONFIG__: JSON.stringify(config)
  },
  plugins: [react()]
})
