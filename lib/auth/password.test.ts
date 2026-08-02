import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("Correct-Horse-1!");
    expect(await verifyPassword(hash, "Correct-Horse-1!")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Correct-Horse-1!");
    expect(await verifyPassword(hash, "wrong-password")).toBe(false);
  });

  it("uses a unique salt per hash", async () => {
    const first = await hashPassword("Same-Password-1!");
    const second = await hashPassword("Same-Password-1!");
    expect(first).not.toBe(second);
  });

  it("returns false for malformed hashes instead of throwing", async () => {
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
  });
});
