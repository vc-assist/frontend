import ReactCompiler from "eslint-plugin-react-compiler"
import tsparser from "@typescript-eslint/parser"

export default [
  {
    files: ["**/*.tsx"],
    languageOptions: {
      parser: tsparser,
    },
    plugins: {
      "eslint-plugin-react-compiler": ReactCompiler,
    },
    rules: {
      "eslint-plugin-react-compiler/react-compiler": "error",
    },
  },
]
