import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "./rate-limit";

// Mock the Redis client so tests exercise the shared-store branch without a
// real Redis instance. `mockStoreDown` flips the client into a failing state.
let mockStoreDown = false;

vi.mock("@upstash/redis", () => {
  class MockRedis {
    private counts = new Map<string, number>();

    incr(key: string): number {
      if (mockStoreDown) throw new Error("store down");
      const next = (this.counts.get(key) ?? 0) + 1;
      this.counts.set(key, next);
      return next;
    }

    expire(): number {
      return 1;
    }

    ttl(): number {
      return 5;
    }

    // Minimal stand-in for the real pipeline: executes INCR then EXPIRE-NX
    // when exec() is called and returns their results in order.
    pipeline() {
      let key = "";
      const pipe = {
        incr: (k: string) => {
          key = k;
          return pipe;
        },
        expire: () => pipe,
        exec: async () => {
          const current = await this.incr(key);
          const expired = await this.expire();
          return [current, expired];
        },
      };
      return pipe;
    }
  }
  return { Redis: MockRedis };
});

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    mockStoreDown = false;
  });

  // Without KV/Upstash env vars the limiter uses the in-process fallback, so
  // the behavior below must hold for local dev and tests.

  it("allows requests under the limit", async () => {
    expect((await rateLimit("ip:1.2.3.4", 3, 1000)).allowed).toBe(true);
    expect((await rateLimit("ip:1.2.3.4", 3, 1000)).allowed).toBe(true);
    expect((await rateLimit("ip:1.2.3.4", 3, 1000)).allowed).toBe(true);
  });

  it("blocks requests over the limit", async () => {
    for (let i = 0; i < 3; i++) await rateLimit("ip:1.2.3.4", 3, 1000);
    const result = await rateLimit("ip:1.2.3.4", 3, 1000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", async () => {
    await rateLimit("ip:a", 1, 1000);
    expect((await rateLimit("ip:a", 1, 1000)).allowed).toBe(false);
    expect((await rateLimit("ip:b", 1, 1000)).allowed).toBe(true);
  });

  it("resets after the window elapses", async () => {
    for (let i = 0; i < 3; i++) await rateLimit("ip:1.2.3.4", 3, 1000);
    expect((await rateLimit("ip:1.2.3.4", 3, 1000)).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect((await rateLimit("ip:1.2.3.4", 3, 1000)).allowed).toBe(true);
  });

  describe("with a configured shared store", () => {
    it("enforces limits through Redis", async () => {
      vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
      vi.stubEnv("KV_REST_API_TOKEN", "token");
      vi.resetModules();

      const mod = await import("./rate-limit");
      expect((await mod.rateLimit("k", 1, 1000)).allowed).toBe(true);
      const blocked = await mod.rateLimit("k", 1, 1000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterMs).toBe(5000);
    });

    it("fails open when the store is unreachable", async () => {
      vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
      vi.stubEnv("KV_REST_API_TOKEN", "token");
      mockStoreDown = true;
      vi.resetModules();

      const mod = await import("./rate-limit");
      const result = await mod.rateLimit("k", 1, 1000);
      expect(result.allowed).toBe(true);
    });
  });
});
