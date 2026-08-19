import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noSecrets from "eslint-plugin-no-secrets";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce the 300-line-per-file policy in ESLint (mirrors lint:size).
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx,mts,cts}"],
    rules: {
      "max-lines": ["warn", { max: 300 }],
      // Images intentionally use native <img> so pre-signed/third-party URLs
      // load directly instead of through Next's image optimizer.
      "@next/next/no-img-element": "off",
    },
  },
  // Flags hardcoded secrets and credential-like literals in source.
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx,mts,cts}"],
    plugins: { "no-secrets": noSecrets },
    rules: {
      "no-secrets/no-secrets": "warn",
    },
  },
  // Type-aware linting: deprecated/obsolete APIs and unsafe `any`-driven
  // flows are reported so security issues surface at lint time.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      // Async safety: never ignore or misuse promises.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      // Unsafe `unknown`/`any` data flows (injection vectors).
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // Correctness and hygiene.
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;