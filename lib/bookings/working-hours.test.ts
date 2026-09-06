import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  groupWorkingHours,
  zonedTodayKey,
  zonedNowMinutes,
  type WorkingHour,
} from "./working-hours";

describe("groupWorkingHours", () => {
  const caseOf = (day: string, opens = "09:00", closes = "19:00", capacity = 1): WorkingHour => ({
    day,
    opens,
    closes,
    capacity,
  });

  it("collapses consecutive same-window weekdays into one group", () => {
    const records = [
      caseOf("Saturday"),
      caseOf("Sunday"),
      caseOf("Monday"),
      caseOf("Tuesday"),
      caseOf("Wednesday"),
    ];
    const groups = groupWorkingHours(records);
    expect(groups).toHaveLength(1);
    expect(groups[0].days).toEqual(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"]);
  });

  it("orders weeks Sunday-first regardless of input order", () => {
    // Thu 09:00-14:00, then Sat+Sun 09:00-19:00 (Sat→Sun wrap forms one group).
    const records = [caseOf("Thursday", "09:00", "14:00"), caseOf("Saturday"), caseOf("Sunday")];
    const groups = groupWorkingHours(records);
    expect(groups).toHaveLength(2);
    // Sunday-first ordering: Thursday (index 4) lists before Saturday (index 6).
    expect(groups[0].days).toEqual(["Thursday"]);
    expect(groups[1].days).toEqual(["Saturday", "Sunday"]);
  });

  it("keeps different-capacity groups separate", () => {
    const records = [caseOf("Sunday", "09:00", "19:00", 2), caseOf("Saturday", "09:00", "19:00", 1)];
    const groups = groupWorkingHours(records);
    expect(groups).toHaveLength(2);
    // Sunday-first ordering puts the Sunday group first.
    expect(groups[0].capacity).toBe(2);
    expect(groups[1].capacity).toBe(1);
  });

  it("merges the Sat→Sun wrap edge case into a single group", () => {
    const groups = groupWorkingHours([
      caseOf("Sunday"),
      caseOf("Monday"),
      caseOf("Tuesday"),
      caseOf("Wednesday"),
      caseOf("Thursday", "09:00", "19:00"),
      caseOf("Friday"),
      caseOf("Saturday", "09:00", "19:00"),
    ]);
    expect(groups).toHaveLength(1);
    // All seven days share one window → one group covering the whole week.
    expect(groups[0].days).toHaveLength(7);
    expect(new Set(groups[0].days).size).toBe(7);
  });

  it("preserves opens/closes/capacity on each group", () => {
    const groups = groupWorkingHours([caseOf("Thursday", "09:00", "14:00", 3)]);
    expect(groups[0]).toMatchObject({ days: ["Thursday"], opens: "09:00", closes: "14:00", capacity: 3 });
  });
});

describe("timezone helpers", () => {
  it("returns YYYY-MM-DD in the target timezone", () => {
    // A fixed instant: 2026-09-05T00:30:00Z.
    const instant = new Date("2026-09-05T00:30:00Z");
    // Asia/Tehran is UTC+3:30 in summer → local date is 2026-09-05.
    expect(zonedTodayKey("Asia/Tehran", instant)).toBe("2026-09-05");
  });

  it("returns minutes since midnight in the target timezone", () => {
    const instant = new Date("2026-09-05T06:30:00Z");
    // 06:30 UTC → 10:00 Asia/Tehran → 600 minutes.
    expect(zonedNowMinutes("Asia/Tehran", instant)).toBe(600);
  });

  it("handles a UTC timezone explicitly", () => {
    const instant = new Date("2026-09-05T23:59:00Z");
    expect(zonedTodayKey("UTC", instant)).toBe("2026-09-05");
  });
});