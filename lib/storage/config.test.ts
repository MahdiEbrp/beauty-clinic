import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_MAX_BYTES,
  DEFAULT_META_ROOT,
  ensureStorage,
  getStorageConfig,
  setStorageConfigForTests,
} from "@/lib/storage/config";

describe("storage config", () => {
  afterEach(() => {
    setStorageConfigForTests(undefined);
  });

  it("defaults to the served public root and an external meta root", () => {
    const config = getStorageConfig();
    expect(config.root).toBe(path.resolve(process.cwd(), "public"));
    expect(config.metaRoot).toBe(DEFAULT_META_ROOT);
    expect(config.maxBytes).toBe(DEFAULT_MAX_BYTES);
    // Meta must stay outside the served root so it is never exposed statically.
    expect(config.metaRoot.startsWith(`${config.root}${path.sep}`)).toBe(false);
  });

  it("honours the test override and keeps the meta root inside it", () => {
    const tmp = path.join(os.tmpdir(), "cfg-tmp");
    setStorageConfigForTests({ root: tmp, maxBytes: 123 });
    const config = getStorageConfig();
    expect(config.root).toBe(tmp);
    expect(config.maxBytes).toBe(123);
    expect(config.metaRoot).toBe(path.join(tmp, ".meta"));
  });

  it("honours an explicit metaRoot override", () => {
    setStorageConfigForTests({ root: "/x", metaRoot: "/y", maxBytes: 1 });
    const config = getStorageConfig();
    expect(config.root).toBe("/x");
    expect(config.metaRoot).toBe("/y");
  });

  describe("ensureStorage", () => {
    let tmp: string;
    beforeEach(() => {
      tmp = path.join(os.tmpdir(), `cfg-${Date.now()}`);
    });
    afterEach(async () => {
      setStorageConfigForTests(undefined);
      await fs.rm(tmp, { recursive: true, force: true });
    });

    it("creates the root and meta root directories", async () => {
      setStorageConfigForTests({ root: path.join(tmp, "root"), metaRoot: path.join(tmp, "meta"), maxBytes: 1 });
      await ensureStorage();
      await expect(fs.access(path.join(tmp, "root"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(tmp, "meta"))).resolves.toBeUndefined();
    });

    it("is recreated after roots are re-pointed", async () => {
      setStorageConfigForTests({ root: path.join(tmp, "r1"), metaRoot: path.join(tmp, "m1"), maxBytes: 1 });
      await ensureStorage();
      await fs.rm(path.join(tmp, "r1"), { recursive: true, force: true });

      setStorageConfigForTests({ root: path.join(tmp, "r2"), metaRoot: path.join(tmp, "m2"), maxBytes: 1 });
      await ensureStorage();
      await expect(fs.access(path.join(tmp, "r2"))).resolves.toBeUndefined();
    });
  });
});