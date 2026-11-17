import { describe, expect, it, vi } from "vitest";
vi.mock("./working-hours", () => ({ DEFAULT_CLINIC_TIMEZONE: "Asia/Tehran" }));

import { planWindowSlots, zonedDateKey, weekdayOf } from "./generator-utils";

describe("planWindowSlots", () => {
  const window = { day: "Saturday", opens: "09:00", closes: "17:00", capacity: 2 };

  it("spaces starts by intervalMin and keeps every slot fully inside [opens, closes)", () => {
    const starts = planWindowSlots(window, 30, 30);
    expect(starts).toEqual([
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30",
    ]);
  });

  it("produces 16 half-hour slots in an 8-hour window", () => {
    const starts = planWindowSlots(window, 30, 30);
    expect(starts).toHaveLength(16);
    expect(starts.at(-1)).toBe("16:30");
  });

  it("excludes a slot whose end would exceed close", () => {
    const narrow = { day: "Monday", opens: "09:00", closes: "10:15", capacity: 1 };
    expect(planWindowSlots(narrow, 30, 30)).toEqual(["09:00", "09:30"]);
  });

  it("returns empty when window is shorter than one slot", () => {
    const tiny = { day: "Monday", opens: "09:00", closes: "09:15", capacity: 1 };
    expect(planWindowSlots(tiny, 30, 30)).toEqual([]);
  });

  it("handles 15-minute spacing correctly", () => {
    const starts = planWindowSlots(window, 15, 30);
    expect(starts).toHaveLength(31);
    expect(starts[0]).toBe("09:00");
    expect(starts.at(-1)).toBe("16:30");
  });
});

describe("zonedDateKey", () => {
  it("returns YYYY-MM-DD in the clinic timezone", () => {
    const instant = new Date("2026-09-05T00:30:00Z");
    expect(zonedDateKey("Asia/Tehran", instant, 0)).toBe("2026-09-05");
  });

  it("applies offsetDays after timezone conversion", () => {
    const instant = new Date("2026-09-05T00:30:00Z");
    expect(zonedDateKey("Asia/Tehran", instant, 1)).toBe("2026-09-06");
  });

  it("handles UTC explicitly", () => {
    const instant = new Date("2026-09-05T23:59:00Z");
    expect(zonedDateKey("UTC", instant, 0)).toBe("2026-09-05");
  });
});

describe("weekdayOf", () => {
  it("returns the English weekday name for a YYYY-MM-DD key", () => {
    expect(weekdayOf("2026-09-05")).toBe("Saturday");
  });

  it("returns Sunday for a known Sunday", () => {
    expect(weekdayOf("2026-09-06")).toBe("Sunday");
  });
});

