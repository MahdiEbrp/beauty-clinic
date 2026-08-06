import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import {
  extOf,
  joinRel,
  normalizeRelativePath,
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
