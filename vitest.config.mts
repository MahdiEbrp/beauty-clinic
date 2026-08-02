import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      DIRECT_URL: "postgres://user:pass@localhost:5432/db",
      AUTH_SECRET: "x".repeat(32),
      ENCRYPTION_KEY: "a".repeat(64),
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    },
  },
});
