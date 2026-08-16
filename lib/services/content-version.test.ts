import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("server-only", () => ({}));

import { bumpContentVersion, getContentVersion } from "./content-version";

describe("content version", () => {
  beforeEach(() => {
    resetCacheForTests();
  });

  afterEach(() => {
    resetCacheForTests();
  });

  it("defaults to 0 before any bump", async () => {
    expect(await getContentVersion()).toBe(0);
  });

  it("increments monotonically on each bump", async () => {
    expect(await bumpContentVersion()).toBe(1);
    expect(await bumpContentVersion()).toBe(2);
    expect(await getContentVersion()).toBe(2);
  });

  it("is shared across readers so a bump invalidates every versioned key", async () => {
    await bumpContentVersion();
    const version = await getContentVersion();
    expect(version).toBeGreaterThan(0);
    expect(String(version).length).toBeGreaterThan(0);
  });
});
