import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("server-only", () => ({}));

// A tiny stateful stand-in for the `content_versions` row so the version
// counter can be exercised without a database.
const { state } = vi.hoisted(() => ({ state: { value: 0 } }));

vi.mock("@/src/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(state.value === 0 ? [] : [{ value: state.value }]),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => ({
          returning: () => {
            state.value += 1;
            return Promise.resolve([{ value: state.value }]);
          },
        }),
      }),
    }),
  },
}));

import { bumpContentVersion, getContentVersion } from "./content-version";

describe("content version", () => {
  beforeEach(() => {
    state.value = 0;
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
    resetCacheForTests();
    expect(await getContentVersion()).toBe(1);
  });
});
