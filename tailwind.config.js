/** @type {import('tailwindcss').Config} */
import uiConfig from "@vcassist/ui/tailwind.config.cjs"
export default {
  ...uiConfig,
  content: [
    "src/**/*.{ts,tsx,css}",
    "ui/foundation/**/*.{ts,tsx}",
    "ui/components/**/*.{ts,tsx}",
    "ui/styles/**/*.css",
  ],
}
