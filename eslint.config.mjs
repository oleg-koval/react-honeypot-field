import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Catch em dashes from LLM/autocorrect — see drop-em-dash-eslint-rule
      // Enable when the package stabilises on flat config
      // "drop-em-dash/no-em-dash": "error",

      // Prefer explicit return types on exported functions
      "@typescript-eslint/explicit-module-boundary-types": "warn",

      // Allow void returns in callbacks
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
    },
  },
  {
    // Relax strictness in test files
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    ignores: ["dist/**", "docs/**", "coverage/**", "*.config.ts", "*.config.mjs"],
  },
);
