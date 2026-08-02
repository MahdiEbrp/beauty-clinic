import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    expect(rateLimit("ip:1.2.3.4", 3, 1000).allowed).toBe(true);
    expect(rateLimit("ip:1.2.3.4", 3, 1000).allowed).toBe(true);
    expect(rateLimit("ip:1.2.3.4", 3, 1000).allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip:1.2.3.4", 3, 1000);
    const result = rateLimit("ip:1.2.3.4", 3, 1000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    rateLimit("ip:a", 1, 1000);
    expect(rateLimit("ip:a", 1, 1000).allowed).toBe(false);
    expect(rateLimit("ip:b", 1, 1000).allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip:1.2.3.4", 3, 1000);
    expect(rateLimit("ip:1.2.3.4", 3, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit("ip:1.2.3.4", 3, 1000).allowed).toBe(true);
  });
});
