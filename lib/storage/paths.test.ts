/* eslint-disable security/detect-non-literal-fs-filename, security/detect-non-literal-regexp -- tests operate on dynamic temp directories by design */
import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ApiError } from "@/lib/api/errors";
import {
  extOf,
  joinRel,
  normalizeRelativePath,
  realPathWithin,
  resolveSafePath,
  sanitizeName,
  splitPath,
} from "@/lib/storage/paths";

describe("normalizeRelativePath", () => {
  it("returns an empty string for the root", () => {
    expect(normalizeRelativePath("")).toBe("");
    expect(normalizeRelativePath("///")).toBe("");
    expect(normalizeRelativePath(".")).toBe("");
  });

  it("strips leading and trailing slashes", () => {
    expect(normalizeRelativePath("/docs/")).toBe("docs");
    expect(normalizeRelativePath("/a/b/")).toBe("a/b");
  });

  it("converts backslashes to forward slashes", () => {
    expect(normalizeRelativePath("a\\b")).toBe("a/b");
  });

  it("rejects traversal and empty segments", () => {
    for (const bad of ["..", "../x", "a/../b", "a//b", "/..", "a/./b"]) {
      expect(() => normalizeRelativePath(bad)).toThrow(ApiError);
    }
  });

  it("rejects overly long paths", () => {
    expect(() => normalizeRelativePath("a/".repeat(1100))).toThrow(ApiError);
  });
});

describe("resolveSafePath", () => {
  it("resolves paths inside the root", () => {
    expect(resolveSafePath("/srv/storage", "docs/a.txt")).toBe("/srv/storage/docs/a.txt");
    expect(resolveSafePath("/srv/storage", "")).toBe("/srv/storage");
  });

  it("never escapes the root", () => {
    for (const rel of ["..", "../x", "a/../../x", "./a"]) {
      expect(() => resolveSafePath("/srv/storage", rel)).toThrow(ApiError);
    }
  });
});

describe("sanitizeName", () => {
  it("accepts a plain name", () => {
    expect(sanitizeName("report.pdf")).toBe("report.pdf");
  });

  it("rejects empty, dot and traversal names", () => {
    for (const name of ["", " ", ".", "..", "a/b"]) {
      expect(() => sanitizeName(name)).toThrow(ApiError);
    }
  });

  it("rejects slashes and null bytes", () => {
    expect(() => sanitizeName("a/b")).toThrow(ApiError);
    expect(() => sanitizeName("a\\b")).toThrow(ApiError);
    expect(() => sanitizeName("a\u0000b")).toThrow(ApiError);
  });

  it("rejects dot-names so hidden files cannot be created or renamed into", () => {
    for (const name of [".env", ".gitignore", ".trash", "./a"]) {
      expect(() => sanitizeName(name)).toThrow(ApiError);
    }
  });
});

describe("joinRel / splitPath / extOf", () => {
  it("joins relative paths", () => {
    expect(joinRel("", "a.txt")).toBe("a.txt");
    expect(joinRel("docs", "a.txt")).toBe("docs/a.txt");
  });

  it("splits entry paths", () => {
    expect(splitPath("a.txt")).toEqual({ parent: "", name: "a.txt" });
    expect(splitPath("docs/a.txt")).toEqual({ parent: "docs", name: "a.txt" });
    expect(() => splitPath("")).toThrow(ApiError);
  });

  it("extracts lowercase extensions", () => {
    expect(extOf("report.PDF")).toBe("pdf");
    expect(extOf("README")).toBe("");
    expect(extOf(".gitignore")).toBe("");
  });
});

describe("realPathWithin", () => {
  it("resolves existing paths inside the root", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "rpw-"));
    try {
      const file = path.join(root, "a.txt");
      await fs.writeFile(file, "x");
      expect(await realPathWithin(root, file)).toBe(await fs.realpath(file));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("resolves non-existent nested targets via the deepest existing ancestor", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "rpw-"));
    try {
      const realRoot = await fs.realpath(root);
      const target = path.join(root, "sub", "new.txt");
      expect(await realPathWithin(root, target)).toBe(path.join(realRoot, "sub", "new.txt"));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("throws when a symlink inside the root points outside it", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "rpw-"));
    const outsideFile = path.join(os.tmpdir(), `outside-${Date.now()}.txt`);
    try {
      await fs.writeFile(outsideFile, "secret");
      const link = path.join(root, "leak.txt");
      await fs.symlink(outsideFile, link);
      await expect(realPathWithin(root, link)).rejects.toThrow(ApiError);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
      await fs.rm(outsideFile, { force: true });
    }
  });

  it("allows a symlink inside the root that stays inside it", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "rpw-"));
    try {
      const realRoot = await fs.realpath(root);
      const inner = path.join(root, "real.txt");
      const link = path.join(root, "shortcut.txt");
      await fs.writeFile(inner, "x");
      await fs.symlink(inner, link);
      expect(await realPathWithin(root, link)).toBe(await fs.realpath(inner));
      expect(await realPathWithin(root, link)).toMatch(new RegExp(`^${realRoot}/`));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
