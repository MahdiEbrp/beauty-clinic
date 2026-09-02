import { describe, expect, it } from "vitest";

import { hashPassword } from "./password";

describe("password hashing", () => {
  it("uses a unique salt per hash", async () => {
    const first = await hashPassword("Same-Password-1!");
    const second = await hashPassword("Same-Password-1!");
    expect(first).not.toBe(second);
  });
});
