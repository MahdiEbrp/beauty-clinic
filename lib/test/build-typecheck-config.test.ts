import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const require = createRequire(import.meta.url);

function readConfig(name: string) {
  const configPath = path.join(root, name);
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  expect(config.error).toBeUndefined();
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  expect(parsed.errors).toEqual([]);
  return parsed;
}

describe("production TypeScript scope", () => {
  it("keeps Next.js type checking enabled with the build config", () => {
    const nextConfig: unknown = require("../../next.config.js");
    expect(nextConfig).toMatchObject({
      typescript: { tsconfigPath: "tsconfig.build.json" },
    });
    expect(nextConfig).not.toMatchObject({
      typescript: { ignoreBuildErrors: true },
    });
  });

  it("preserves strict settings and every non-test application source file", () => {
    const full = readConfig("tsconfig.json");
    const build = readConfig("tsconfig.build.json");
    expect(build.options.strict).toBe(true);
    expect(build.options).toEqual(full.options);
    const applicationFiles = full.fileNames.filter((file) => {
      const relative = path.relative(root, file).replaceAll(path.sep, "/");
      return /^(app|components|lib|src)\//.test(relative)
        && !/\.(test|spec)\.tsx?$/.test(relative)
        && !relative.includes("/__tests__/")
        && !relative.startsWith("lib/test/");
    });
    expect(applicationFiles.length).toBeGreaterThan(0);
    const buildFiles = new Set(build.fileNames);
    expect(applicationFiles.filter((file) => !buildFiles.has(file))).toEqual([]);
  });

  it("keeps tests in full typecheck but out of deployment typecheck", () => {
    const full = readConfig("tsconfig.json");
    const build = readConfig("tsconfig.build.json");
    const testFiles = full.fileNames.filter((file) => /\.test\.tsx?$/.test(file));
    expect(testFiles.length).toBeGreaterThan(0);
    const buildFiles = new Set(build.fileNames);
    expect(testFiles.filter((file) => buildFiles.has(file))).toEqual([]);
    expect(build.fileNames.some((file) => file.endsWith("vitest.config.mts"))).toBe(false);
    expect(build.fileNames.some((file) => file.endsWith("drizzle.config.ts"))).toBe(false);
  });
});
