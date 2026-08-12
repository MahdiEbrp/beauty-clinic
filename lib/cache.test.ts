import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cacheDel, cacheGet, cacheSet, cacheWrap } from "./cache";

// Mock the Redis client so the shared-store branch can be exercised without a
// real Redis instance. The rest of the suite runs with no KV/Upstash env vars,
// which makes the cache fall back to its in-process store.
vi.mock("@upstash/redis", () => {
  class MockRedis {
    private store = new Map<string, string>();

    get(key: string): string | null {
      return this.store.get(key) ?? null;
    }

    set(key: string, value: string): string {
      this.store.set(key, value);
      return "OK";
    }

    del(key: string): number {
      return this.store.delete(key) ? 1 : 0;
    }
  }
  return { Redis: MockRedis };
});

describe("cache (in-memory fallback)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("round-trips a JSON-safe value", async () => {
    await cacheSet("mem:roundtrip", { a: 1, b: "x", c: null }, 60);
    expect(await cacheGet("mem:roundtrip")).toEqual({ a: 1, b: "x", c: null });
  });

  it("returns undefined on a miss", async () => {
    expect(await cacheGet("mem:missing")).toBeUndefined();
  });

  it("expires after the TTL", async () => {
    await cacheSet("mem:ttl", "v", 60);
    vi.advanceTimersByTime(60_001);
    expect(await cacheGet("mem:ttl")).toBeUndefined();
  });

  it("cacheWrap computes on a miss and serves the cache on a hit", async () => {
    const producer = vi.fn(async () => ({ n: 42 }));
    expect(await cacheWrap("mem:wrap", 60, producer)).toEqual({ n: 42 });
    expect(await cacheWrap("mem:wrap", 60, producer)).toEqual({ n: 42 });
    expect(producer).toHaveBeenCalledTimes(1);
  });

  it("cacheWrap dedupes concurrent misses (single flight)", async () => {
    vi.useRealTimers();
    let calls = 0;
    const producer = async (): Promise<number> => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 25));
      return calls;
    };
    const [a, b] = await Promise.all([
      cacheWrap("mem:flight", 60, producer),
      cacheWrap("mem:flight", 60, producer),
    ]);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(calls).toBe(1);
  });

  it("cacheDel busts a cached value so the producer re-runs", async () => {
    const producer = vi.fn(async () => "v");
    await cacheWrap("mem:bust", 60, producer); // miss -> compute
    await cacheWrap("mem:bust", 60, producer); // hit
    await cacheDel("mem:bust");
    await cacheWrap("mem:bust", 60, producer); // miss again
    expect(producer).toHaveBeenCalledTimes(2);
  });
});

describe("cache (shared Redis store)", () => {
  it("round-trips and deletes through Redis", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");
    vi.resetModules();

    const mod = await import("./cache");
    await mod.cacheSet("redis:kr", { x: 1 }, 60);
    expect(await mod.cacheGet<{ x: number }>("redis:kr")).toEqual({ x: 1 });
    await mod.cacheDel("redis:kr");
    expect(await mod.cacheGet("redis:kr")).toBeUndefined();
  });
});