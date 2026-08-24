import { describe, expect, it } from "vitest";

import {
  computeSlotStatus,
  isBookableStatus,
  slotStatusCondition,
} from "./slot-status";

function at(y: number, m: number, d: number, h = 0, min = 0): Date {
  return new Date(y, m - 1, d, h, min);
}

describe("computeSlotStatus", () => {
  it("reports inactive whenever the admin toggle is off", () => {
    expect(computeSlotStatus(false, "2026-01-01", "23:59:59", at(2026, 1, 1))).toBe(
      "inactive",
    );
    // Inactive wins even for past slots.
    expect(computeSlotStatus(false, "2000-01-01", "00:00:00")).toBe("inactive");
  });

  it("reports expired when the end datetime has passed", () => {
    const now = at(2026, 8, 24, 12, 0);
    expect(computeSlotStatus(true, "2026-08-24", "11:59:00", now)).toBe("expired");
    expect(computeSlotStatus(true, "2026-08-24", "12:00:00", now)).toBe("expired");
  });

  it("reports active while the end datetime is still ahead", () => {
    const now = at(2026, 8, 24, 12, 0);
    expect(computeSlotStatus(true, "2026-08-24", "12:01:00", now)).toBe("active");
    expect(computeSlotStatus(true, "2026-08-25", "09:00:00", now)).toBe("active");
  });
});

describe("isBookableStatus", () => {
  it("only accepts derived-active slots", () => {
    expect(isBookableStatus("active")).toBe(true);
    expect(isBookableStatus("inactive")).toBe(false);
    expect(isBookableStatus("expired")).toBe(false);
  });
});

describe("slotStatusCondition", () => {
  it("matches the JS derivation for each branch", () => {
    expect(slotStatusCondition("expired")).toContain("now() >");
    expect(slotStatusCondition("active")).toContain('"is_active" = true');
    expect(slotStatusCondition("inactive")).toContain('"is_active" = false');
    // Never interpolates arbitrary table names.
    expect(slotStatusCondition("active", "other")).toContain('"other"."slot_date"');
  });
});
