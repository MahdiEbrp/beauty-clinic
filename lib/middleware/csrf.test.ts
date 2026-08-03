import { describe, expect, it } from "vitest";

import { checkCsrf } from "./csrf";

function makeRequest(origin?: string, referer?: string) {
  const headers = new Headers({ host: "localhost:3000" });
  if (origin) headers.set("origin", origin);
  if (referer) headers.set("referer", referer);
  return { headers };
}

describe("checkCsrf", () => {
  it("accepts a matching origin", () => {
    expect(checkCsrf(makeRequest("http://localhost:3000")).ok).toBe(true);
  });

  it("rejects a cross-origin request", () => {
    expect(checkCsrf(makeRequest("https://evil.example.com")).ok).toBe(false);
  });

  it("rejects the string null origin", () => {
    expect(checkCsrf(makeRequest("null")).ok).toBe(false);
  });

  it("rejects an invalid origin URL", () => {
    expect(checkCsrf(makeRequest("not a url")).ok).toBe(false);
  });

  it("accepts a matching referer when origin is absent", () => {
    expect(checkCsrf(makeRequest(undefined, "http://localhost:3000/some-page")).ok).toBe(true);
  });

  it("rejects a cross-origin referer", () => {
    expect(checkCsrf(makeRequest(undefined, "https://evil.example.com/")).ok).toBe(false);
  });

  it("rejects when no origin or referer is present", () => {
    expect(checkCsrf(makeRequest()).ok).toBe(false);
  });

  it("rejects when host is missing", () => {
    const { headers } = makeRequest("http://localhost:3000");
    headers.delete("host");
    expect(checkCsrf({ headers }).ok).toBe(false);
  });
});
