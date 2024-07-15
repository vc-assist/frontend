const colors = require("tailwindcss/colors")

module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: contentPaths,
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
