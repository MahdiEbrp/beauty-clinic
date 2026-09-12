import { randomUUID, createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPaymentRetryToken, readPaymentRetryToken } from "./retry-token";

const SECRET = "s".repeat(64);

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

describe("payment retry tokens", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", SECRET);
  });

  it("accepts a signed, unexpired token", () => {
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 60_000);

    const token = createPaymentRetryToken(id, expiresAt);

    expect(readPaymentRetryToken(token)).toEqual({ id, exp: expiresAt.getTime() });
  });

  it("rejects altered and expired tokens", () => {
    const id = randomUUID();
    const valid = createPaymentRetryToken(id, new Date(Date.now() + 60_000));
    const expired = createPaymentRetryToken(id, new Date(Date.now() - 1_000));

    expect(readPaymentRetryToken(`${valid}x`)).toBeNull();
    expect(readPaymentRetryToken(expired)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const payload = Buffer.from(JSON.stringify({ id: randomUUID(), exp: Date.now() + 60_000 }), "utf8").toString("base64url");
    const token = `${payload}.${sign(payload, "y".repeat(64))}`;

    expect(readPaymentRetryToken(token)).toBeNull();
  });

  it("rejects malformed payloads", () => {
    const now = Date.now() + 60_000;
    const validId = randomUUID();
    const cases = [
      `${Buffer.from("not-json", "utf8").toString("base64url")}`,
      `${Buffer.from(JSON.stringify({ id: "short", exp: now }), "utf8").toString("base64url")}`,
      `${Buffer.from(JSON.stringify({ id: validId, exp: "later" }), "utf8").toString("base64url")}`,
      `${Buffer.from(JSON.stringify([validId, now]), "utf8").toString("base64url")}`,
    ];

    for (const payload of cases) {
      const token = `${payload}.${sign(payload, SECRET)}`;
      expect(readPaymentRetryToken(token), `payload: ${payload}`).toBeNull();
    }
  });

  it("rejects tokens with extra segments", () => {
    const token = createPaymentRetryToken(randomUUID(), new Date(Date.now() + 60_000));

    expect(readPaymentRetryToken(`${token}.extra`)).toBeNull();
  });

  it("refuses to sign without a strong AUTH_SECRET", () => {
    vi.stubEnv("AUTH_SECRET", undefined);
    expect(() => createPaymentRetryToken(randomUUID(), new Date(Date.now() + 60_000))).toThrow(/AUTH_SECRET/);
  });
});
