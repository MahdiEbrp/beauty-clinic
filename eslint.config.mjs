import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce the 300-line-per-file policy in ESLint (mirrors lint:size).
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx,mts,cts}"],
    rules: {
      "max-lines": ["warn", { max: 300 }],
    },
  },
  // Security-focused rules that catch unsafe code patterns:
  // eval, child_process, weak randomness, CSRF bypass, timing attacks,
  // unsafe regex and non-literal fs paths.
  {
    files: ["**/*.{js,mjs,ts,tsx,mts,cts}"],
    plugins: { security },
    rules: {
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "warn",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-object-injection": "warn",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-unsafe-regex": "warn",
      "security/detect-bidi-characters": "warn",
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