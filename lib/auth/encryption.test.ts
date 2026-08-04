import { describe, expect, it } from "vitest";

import { decryptSecret, encryptSecret } from "./encryption";

const SECRET = "Bearer sk_live_1234567890abcdef";

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a secret", () => {
    const payload = encryptSecret(SECRET);
    expect(payload).toBeTruthy();
    expect(decryptSecret(payload)).toBe(SECRET);
  });

  it("round-trips unicode and special characters", () => {
    const tricky = "پارسی ✅\nline2\ttab\\\"quotes\"";
    expect(decryptSecret(encryptSecret(tricky))).toBe(tricky);
  });

  it("produces a versioned payload with four dot-separated parts", () => {
    const parts = encryptSecret(SECRET).split(".");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("v1");
  });

  it("uses a fresh random IV on every call (no deterministic output)", () => {
    const a = encryptSecret(SECRET);
    const b = encryptSecret(SECRET);
    expect(a).not.toBe(b);
  });

  it("rejects an unsupported version", () => {
    const payload = encryptSecret(SECRET);
    const tampered = `v0${payload.slice(2)}`;
    expect(() => decryptSecret(tampered)).toThrow("Unsupported encryption version");
  });

  it("rejects a tampered payload (auth tag mismatch)", () => {
    const payload = encryptSecret(SECRET);
    const [version, iv, tag, data] = payload.split(".");
    // Flip a character in the ciphertext: GCM authentication must fail.
    const corrupted = data.endsWith("A") ? `${data.slice(0, -1)}B` : `${data.slice(0, -1)}A`;
    const tampered = [version, iv, tag, corrupted].join(".");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("rejects a tampered auth tag", () => {
    const payload = encryptSecret(SECRET);
    const [version, iv, tag, data] = payload.split(".");
    const badTag = tag.endsWith("A") ? `${tag.slice(0, -1)}B` : `${tag.slice(0, -1)}A`;
    expect(() => decryptSecret([version, iv, badTag, data].join("."))).toThrow();
  });

  it("rejects malformed input", () => {
    expect(() => decryptSecret("garbage")).toThrow();
    expect(() => decryptSecret("")).toThrow();
  });

  it("decrypts a payload produced with the configured key", () => {
    // Deterministic fixture: encrypt, then decrypt within the same module
    // instance — proves the key is stable across calls.
    const first = decryptSecret(encryptSecret("stable-key-check"));
    expect(first).toBe("stable-key-check");
  });
});
