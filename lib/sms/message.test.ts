import { describe, expect, it } from "vitest";

import { countSmsParts, getSmsEncoding, getSmsLengthLabel } from "./message";

describe("SMS message length", () => {
  it("recognizes GSM-7 and Unicode messages", () => {
    expect(getSmsEncoding("Hello")).toBe("gsm7");
    expect(getSmsEncoding("سلام")).toBe("unicode");
  });

  it("uses multipart limits for long messages", () => {
    expect(countSmsParts("a".repeat(160))).toBe(1);
    expect(countSmsParts("a".repeat(161))).toBe(2);
    expect(countSmsParts("س".repeat(70))).toBe(1);
    expect(countSmsParts("س".repeat(71))).toBe(2);
  });

  it("returns character count, part count, and encoding", () => {
    expect(getSmsLengthLabel("سلام")).toEqual({
      characters: 4,
      parts: 1,
      encoding: "unicode",
    });
  });
});
