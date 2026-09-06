import { describe, expect, it } from "vitest";

import {
  createWorkingHourSchema,
  slotPatternSchema,
  updateWorkingHourSchema,
} from "./working-hours";

const base = {
  day: "Saturday",
  opens: "09:00",
  closes: "18:00",
  capacity: 1,
  displayOrder: 0,
  isActive: true,
};

describe("slotPatternSchema", () => {
  it("accepts a valid row", () => {
    expect(slotPatternSchema.safeParse({ startTime: "13:15", capacity: 2 }).success).toBe(true);
  });

  it("rejects a malformed time", () => {
    expect(slotPatternSchema.safeParse({ startTime: "25:00", capacity: 1 }).success).toBe(false);
  });

  it("rejects a zero or negative capacity", () => {
    expect(slotPatternSchema.safeParse({ startTime: "13:15", capacity: 0 }).success).toBe(false);
    expect(slotPatternSchema.safeParse({ startTime: "13:15", capacity: -2 }).success).toBe(false);
  });

  it("rejects unknown keys", () => {
    expect(
      slotPatternSchema.safeParse({ startTime: "13:15", capacity: 1, day: "Sunday" }).success,
    ).toBe(false);
  });
});

describe("createWorkingHourSchema patterns", () => {
  it("is optional", () => {
    expect(createWorkingHourSchema.safeParse(base).success).toBe(true);
  });

  it("accepts a unique sorted-capable list", () => {
    const result = createWorkingHourSchema.safeParse({
      ...base,
      patterns: [
        { startTime: "13:15", capacity: 2 },
        { startTime: "13:30", capacity: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects duplicate start times", () => {
    const result = createWorkingHourSchema.safeParse({
      ...base,
      patterns: [
        { startTime: "13:15", capacity: 1 },
        { startTime: "13:15", capacity: 2 },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "patterns")).toBe(true);
    }
  });

  it("rejects more than 96 pattern rows", () => {
    const patterns = Array.from({ length: 97 }, (_, i) => ({
      startTime: `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
      capacity: 1,
    }));
    const result = createWorkingHourSchema.safeParse({ ...base, patterns });
    expect(result.success).toBe(false);
  });
});

describe("patterns on update", () => {
  it("accepts clearing patterns with an empty array", () => {
    expect(updateWorkingHourSchema.safeParse({ patterns: [] }).success).toBe(true);
  });

  it("rejects duplicates on update too", () => {
    const result = updateWorkingHourSchema.safeParse({
      patterns: [
        { startTime: "10:00", capacity: 1 },
        { startTime: "10:00", capacity: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });
});