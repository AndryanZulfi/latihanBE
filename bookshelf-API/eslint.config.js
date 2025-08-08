import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2021,
    },
    plugins: { js },
    extends: [js.configs.recommended],
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"], 
      indent: ["error", 2] 
    }
  }
]);
