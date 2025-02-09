import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      globals: {
        __dirname: "readonly",
        process: "readonly",
        console: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": ts
    },
    rules: {
      ...ts.configs.recommended.rules
    },
  },
  prettierConfig
];
