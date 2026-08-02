import { describe, expect, it } from "vitest";

import { decryptSession, encryptSession } from "./jwt";

const claims = {
  sessionId: "a9f1c0a8-0000-0000-0000-000000000001",
  userId: "a9f1c0a8-0000-0000-0000-000000000002",
  tokenHash: "0123456789abcdef0123456789abcdef",
};

describe("session JWT", () => {
  it("encrypts and decrypts claims", async () => {
    const token = await encryptSession(claims);
    expect(token).toBeTruthy();
    expect(await decryptSession(token)).toEqual(claims);
  });

  it("returns null for a tampered token", async () => {
    const token = await encryptSession(claims);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(await decryptSession(tampered)).toBeNull();
  });

  it("returns null for garbage", async () => {
    expect(await decryptSession("not-a-jwt")).toBeNull();
  });

  it("returns null for no token", async () => {
    expect(await decryptSession(undefined)).toBeNull();
  });
});
