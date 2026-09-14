import { describe, expect, it } from "vitest";

import type { CartItem, SlotOption } from "@/components/booking/types";
import {
  autoSchedule,
  buildDayOptions,
  doSlotsOverlap,
  findCartConflicts,
  slotDuration,
} from "./scheduling";

function slot(id: string, date: string, start: string, end: string): SlotOption {
  return {
    id,
    groupIds: [],
    slotDate: date,
    startTime: start,
    endTime: end,
    capacity: 2,
    isActive: true,
    bookedCount: 0,
    available: true,
  };
}

function line(id: string, s: SlotOption | null, quantity = 1): CartItem {
  return {
    group: {
      id,
      slug: id,
      title: id,
      description: null,
      icon: null,
      image: null,
      categories: [],
      groupIndex: 0,
    },
    quantity,
    slot: s,
  };
}

const OPEN_HOURS = [
  { days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"], opens: "09:00", closes: "19:00" },
  { days: ["Thursday"], opens: "09:00", closes: "14:00" },
];

describe("doSlotsOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(doSlotsOverlap("09:00", 45, "09:30", 45)).toBe(true);
  });
  it("allows back-to-back slots", () => {
    expect(doSlotsOverlap("09:00", 45, "09:45", 45)).toBe(false);
  });
});

describe("slotDuration", () => {
  it("falls back to 45 minutes", () => {
    expect(slotDuration({ ...slot("a", "2026-01-01", "10:00", "10:00") })).toBe(45);
  });
});

describe("findCartConflicts", () => {
  it("flags overlapping lines on the same day", () => {
    const items = [
      line("a", slot("s1", "2026-01-01", "09:00", "09:45")),
      line("b", slot("s2", "2026-01-01", "09:30", "10:15")),
    ];
    expect(findCartConflicts(items)).toHaveLength(1);
  });

  it("ignores the same slot (shared seat) and other days", () => {
    const items = [
      line("a", slot("s1", "2026-01-01", "09:00", "09:45")),
      line("b", slot("s1", "2026-01-01", "09:00", "09:45")),
      line("c", slot("s3", "2026-01-02", "09:00", "09:45")),
    ];
    expect(findCartConflicts(items)).toHaveLength(0);
  });
});

describe("buildDayOptions", () => {
  it("marks Friday closed and Thursday half-day", () => {
    // 2026-01-01 is a Thursday.
    const days = buildDayOptions(OPEN_HOURS, 7, new Date("2026-01-01T00:00:00"));
    const byDate = new Map(days.map((d) => [d.dateStr, d]));
    expect(byDate.get("2026-01-01")?.isOpen).toBe(true);
    expect(byDate.get("2026-01-01")?.closes).toBe("14:00");
    expect(byDate.get("2026-01-02")?.isOpen).toBe(false); // Friday
    expect(byDate.get("2026-01-03")?.isOpen).toBe(true); // Saturday
  });
});

describe("autoSchedule", () => {
  it("places lines on consecutive free slots of one day", () => {
    const days = buildDayOptions(OPEN_HOURS, 1, new Date("2026-01-03T00:00:00"));
    const slotsByDate = new Map([
      ["2026-01-03", [slot("a", "2026-01-03", "09:00", "09:45"), slot("b", "2026-01-03", "09:45", "10:30")]],
    ]);
    const result = autoSchedule([line("x", null), line("y", null)], days, slotsByDate);
    expect(result.map((r) => r.slot?.id)).toEqual(["a", "b"]);
  });

  it("spreads over days when one day cannot fit all lines", () => {
    const days = buildDayOptions(OPEN_HOURS, 2, new Date("2026-01-03T00:00:00"));
    const slotsByDate = new Map([
      ["2026-01-03", [slot("a", "2026-01-03", "09:00", "09:45")]],
      ["2026-01-04", [slot("b", "2026-01-04", "09:00", "09:45")]],
    ]);
    const result = autoSchedule([line("x", null), line("y", null)], days, slotsByDate);
    expect(result[0].slot?.slotDate).toBe("2026-01-03");
    expect(result[1].slot?.slotDate).toBe("2026-01-04");
  });
});
