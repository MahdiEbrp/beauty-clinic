import { afterEach, describe, expect, it, vi } from "vitest";

import { clientIp } from "./request";

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/v1/test", { headers });
}

describe("clientIp", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined when no trusted header is present", () => {
    expect(clientIp(requestWith({}))).toBeUndefined();
  });

  it("prefers x-vercel-forwarded-for over other headers", () => {
    const request = requestWith({
      "x-vercel-forwarded-for": "203.0.113.10",
      "cf-connecting-ip": "203.0.113.11",
      "x-real-ip": "203.0.113.20",
      "x-forwarded-for": "203.0.113.30",
    });
    expect(clientIp(request)).toBe("203.0.113.10");
  });

  it("trusts cf-connecting-ip (Cloudflare)", () => {
    const request = requestWith({ "cf-connecting-ip": "198.51.100.9" });
    expect(clientIp(request)).toBe("198.51.100.9");
  });

  it("falls back to x-real-ip when no platform header is present", () => {
    const request = requestWith({ "x-real-ip": "203.0.113.20" });
    expect(clientIp(request)).toBe("203.0.113.20");
  });

  it("ignores a client-forged x-forwarded-for header by default", () => {
    const request = requestWith({ "x-forwarded-for": "198.51.100.66" });
    expect(clientIp(request)).toBeUndefined();
  });

  it("trusts x-forwarded-for only when TRUST_PROXY=1", () => {
    const request = requestWith({ "x-forwarded-for": "198.51.100.66" });
    vi.stubEnv("TRUST_PROXY", "1");
    expect(clientIp(request)).toBe("198.51.100.66");
  });

  it("takes the first entry of a comma-separated trusted header", () => {
    const request = requestWith({ "x-real-ip": "203.0.113.5, 10.0.0.1" });
    expect(clientIp(request)).toBe("203.0.113.5");
  });
});
