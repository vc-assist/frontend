const colors = require("tailwindcss/colors")

module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "src/**/*.tsx",
    "ui/components/**/*.tsx",
    "ui/foundation/**/*.tsx",
    "ui/styles/**/*.css",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",

      gray: colors.gray,
      zinc: colors.zinc,

      blue: colors.blue,
      red: colors.red,
      green: colors.green,

      primary: "var(--primary)",
      dimmed: "var(--dimmed)",
      "dimmed-subtle": "var(--dimmed-subtle)",

      bg: "var(--bg)",
      "bg-dimmed": "var(--bg-dimmed)",

      accent: "var(--accent)",

      "light-green": "#53b486",
    },
  },
}
