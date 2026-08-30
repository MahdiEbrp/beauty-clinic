import { describe, expect, it } from "vitest";

import {
  maskIranianPhone,
  normalizeIranianPhone,
  normalizeRecipients,
} from "./phone";

describe("Iranian phone helpers", () => {
  it("normalizes local, international, and Persian-digit formats", () => {
    expect(normalizeIranianPhone("0912 123 4567")).toBe("+989121234567");
    expect(normalizeIranianPhone("989121234567")).toBe("+989121234567");
    expect(normalizeIranianPhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("+989121234567");
  });

  it("rejects invalid mobile prefixes and lengths", () => {
    expect(normalizeIranianPhone("02112345678")).toBeNull();
    expect(normalizeIranianPhone("0912123456")).toBeNull();
  });

  it("masks all but the identifying prefix and suffix", () => {
    expect(maskIranianPhone("09121234567")).toBe("+98••••4567");
  });

  it("returns invalid and duplicate recipients separately", () => {
    expect(normalizeRecipients(["09121234567", "+989121234567", "02112345678"])).toEqual({
      recipients: ["+989121234567"],
      invalid: ["02112345678"],
      duplicates: ["+989121234567"],
    });
  });
});
