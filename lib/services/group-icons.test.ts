import { describe, expect, it } from "vitest";

import {
  ICON_NAME_SET,
  canonicalIconName,
  groupIconForKey,
  searchAllIcons,
} from "@/data/group-icons";

describe("canonicalIconName", () => {
  it("passes through canonical kebab-case names", () => {
    expect(canonicalIconName("sparkles")).toBe("sparkles");
    expect(canonicalIconName("wand-2")).toBe("wand-2");
  });

  it("maps legacy PascalCase component names to kebab-case", () => {
    expect(canonicalIconName("Sparkles")).toBe("sparkles");
    expect(canonicalIconName("Wand2")).toBe("wand-2");
    expect(canonicalIconName("HeartPulse")).toBe("heart-pulse");
  });

  it("returns null for unknown keys", () => {
    expect(canonicalIconName("not-a-real-icon")).toBeNull();
    expect(canonicalIconName("")).toBeNull();
  });
});

describe("searchAllIcons", () => {
  it("returns matching canonical kebab-case names", () => {
    const results = searchAllIcons("sparkle");
    expect(results).toContain("sparkles");
    expect(results.length).toBeGreaterThan(0);
  });

  it("is case-insensitive and ignores separators", () => {
    const byDash = searchAllIcons("wand-2");
    const bySpace = searchAllIcons("wand 2");
    expect(byDash).toContain("wand-2");
    expect(bySpace).toEqual(byDash);
  });

  it("returns an empty array for an empty or unmatched query", () => {
    expect(searchAllIcons("")).toEqual([]);
    expect(searchAllIcons("   ")).toEqual([]);
    expect(searchAllIcons("zzzz-not-an-icon")).toEqual([]);
  });
});

describe("ICON_NAME_SET", () => {
  it("contains the canonical name of every curated icon", () => {
    expect(ICON_NAME_SET.has("sparkles")).toBe(true);
    expect(ICON_NAME_SET.has("wand-2")).toBe(true);
    expect(ICON_NAME_SET.has("heart-pulse")).toBe(true);
  });
});

describe("groupIconForKey", () => {
  it("resolves curated PascalCase keys to a component", () => {
    expect(groupIconForKey("Sparkles")).toBeTruthy();
    expect(groupIconForKey("Wand2")).toBeTruthy();
  });

  it("resolves canonical kebab-case keys when they are curated", () => {
    expect(groupIconForKey("sparkles")).toBeTruthy();
    expect(groupIconForKey("wand-2")).toBeTruthy();
  });

  it("returns null for unknown keys and null input", () => {
    expect(groupIconForKey(null)).toBeNull();
    expect(groupIconForKey("totally-unknown")).toBeNull();
    expect(groupIconForKey("")).toBeNull();
  });
});
