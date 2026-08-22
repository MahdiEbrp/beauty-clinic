import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { isOpenAt } from "./availability";
import { bookingErrorKey, BOOKING_ERRORS } from "./errors";

const OPENING_HOURS = [
  { days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"], opens: "09:00", closes: "19:00" },
  { days: ["Thursday"], opens: "09:00", closes: "14:00" },
];

function at(day: number, hour: number, minute = 0): Date {
  return new Date(2026, 7, day, hour, minute);
}

describe("isOpenAt", () => {
  it("returns true when there is no opening-hours data", () => {
    expect(isOpenAt(at(8, 10), at(8, 11), undefined)).toBe(true);
    expect(isOpenAt(at(8, 10), at(8, 11), [])).toBe(true);
    expect(isOpenAt(at(8, 10), at(8, 11), [{ bad: true }])).toBe(true);
  });

  it("accepts a slot fully inside opening hours", () => {
    expect(isOpenAt(at(8, 10, 0), at(8, 10, 45), OPENING_HOURS)).toBe(true);
  });

  it("rejects a slot that starts at or before opening", () => {
    expect(isOpenAt(at(8, 8, 59), at(8, 9, 30), OPENING_HOURS)).toBe(false);
  });

  it("rejects a slot that ends after closing", () => {
    expect(isOpenAt(at(8, 18, 40), at(8, 19, 0), OPENING_HOURS)).toBe(false);
  });

  it("rejects a slot on a day the clinic is closed", () => {
    // 2026-08-07 is a Friday — no opening entry matches.
    expect(isOpenAt(at(7, 12), at(7, 13), OPENING_HOURS)).toBe(false);
  });

  it("honours day-specific hours (Thursday closes early)", () => {
    expect(isOpenAt(at(6, 13, 30), at(6, 14, 0), OPENING_HOURS)).toBe(false);
    expect(isOpenAt(at(6, 10, 0), at(6, 10, 30), OPENING_HOURS)).toBe(true);
  });
});

describe("bookingErrorKey", () => {
  it("maps a known error code to its catalog key", () => {
    expect(bookingErrorKey(new ApiError(409, "SLOT_FULL", "x"))).toBe("slotFull");
    expect(bookingErrorKey(new ApiError(409, "BUSINESS_CLOSED", "x"))).toBe("businessClosed");
  });

  it("falls back to the system-error key for unknown codes", () => {
    expect(bookingErrorKey(new ApiError(500, "WHATEVER", "x"))).toBe("systemError");
    expect(bookingErrorKey(new Error("boom"))).toBe("systemError");
    expect(bookingErrorKey(null)).toBe("systemError");
  });

  it("every catalog key maps to a numeric error category", () => {
    for (const code of Object.keys(BOOKING_ERRORS)) {
      expect(typeof BOOKING_ERRORS[code as keyof typeof BOOKING_ERRORS].no).toBe("number");
      expect(typeof BOOKING_ERRORS[code as keyof typeof BOOKING_ERRORS].key).toBe("string");
    }
  });
});
