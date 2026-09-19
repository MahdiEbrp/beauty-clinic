import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

vi.mock("./generator", () => ({
  readGeneratorConfig: () => ({ durationMin: 15 }),
  ensureAutoSlots: vi.fn(() => ({ created: 0 })),
}));

import { db } from "@/src/db";
import { ensureAutoSlots } from "./generator";
import {
  createWorkingHour,
  deleteWorkingHour,
  deleteWorkingHours,
  getWorkingHour,
  updateWorkingHour,
} from "./working-hours-admin";

const mockDb = db as unknown as MockDb;

function makeRecord(overrides: Partial<Row> = {}): Row {
  return {
    id: randomUUID(),
    day: "Monday",
    opens: "09:00:00",
    closes: "17:00:00",
    capacity: 2,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

beforeEach(() => {
  mockDb.reset();
  resetCacheForTests();
});

describe("working-hours slot patterns", () => {
  const base = {
    opens: "09:00",
    closes: "18:00",
    capacity: 1,
    displayOrder: 0,
    isActive: true,
  };

  it("create persists sorted patterns and getWorkingHour returns them", async () => {
    const row = await createWorkingHour({
      ...base,
      day: "Saturday",
      patterns: [
        { startTime: "17:30", capacity: 2 },
        { startTime: "13:15", capacity: 2 },
        { startTime: "13:30", capacity: 1 },
      ],
    });
    expect(mockDb.data.slot_patterns).toHaveLength(3);
    expect(mockDb.data.slot_patterns.map((p) => p.startTime)).toEqual([
      "13:15",
      "13:30",
      "17:30",
    ]);
    const detail = await getWorkingHour(row.id);
    expect(detail?.patterns).toEqual([
      { startTime: "13:15", capacity: 2, groupIds: [] },
      { startTime: "13:30", capacity: 1, groupIds: [] },
      { startTime: "17:30", capacity: 2, groupIds: [] },
    ]);
  });

  it("persists pattern group links and returns them", async () => {
    const row = await createWorkingHour({
      ...base,
      day: "Saturday",
      patterns: [
        { startTime: "13:15", capacity: 2, groupIds: ["g1", "g2"] },
        { startTime: "13:30", capacity: 1, groupIds: [] },
      ],
    });
    const detail = await getWorkingHour(row.id);
    expect(detail?.patterns).toEqual([
      { startTime: "13:15", capacity: 2, groupIds: ["g1", "g2"] },
      { startTime: "13:30", capacity: 1, groupIds: [] },
    ]);
    expect(mockDb.data.slot_pattern_groups).toHaveLength(2);
  });

  it("update with empty patterns clears the day and re-materializes it", async () => {
    mockDb.seed("working_hours", [makeRecord({ id: "wh", day: "Sunday" })]);
    mockDb.seed("slot_patterns", [
      { id: randomUUID(), day: "Sunday", start_time: "13:15:00", capacity: 1 },
    ]);
    await updateWorkingHour("wh", {
      patterns: [],
    });
    expect(mockDb.data.slot_patterns ?? []).toHaveLength(0);
    // Clearing patterns still re-materializes the day (pattern → uniform).
    expect(vi.mocked(ensureAutoSlots)).toHaveBeenCalledWith(true);
  });

  it("delete removes the day's patterns too", async () => {
    mockDb.seed("working_hours", [makeRecord({ id: "wh", day: "Saturday" })]);
    mockDb.seed("slot_patterns", [
      { id: randomUUID(), day: "Saturday", start_time: "13:15:00", capacity: 1 },
      { id: randomUUID(), day: "Sunday", start_time: "10:00:00", capacity: 1 },
    ]);
    await deleteWorkingHour("wh");
    expect(mockDb.data.working_hours).toHaveLength(0);
    expect(mockDb.data.slot_patterns).toHaveLength(1);
    expect(mockDb.data.slot_patterns[0].day).toBe("Sunday");
  });

  it("deleteWorkingHours cleans the patterns of targeted days", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ id: "a", day: "Saturday" }),
      makeRecord({ id: "b", day: "Sunday" }),
    ]);
    mockDb.seed("slot_patterns", [
      { id: randomUUID(), day: "Saturday", start_time: "13:15:00", capacity: 1 },
      { id: randomUUID(), day: "Sunday", start_time: "10:00:00", capacity: 1 },
    ]);
    await deleteWorkingHours(["a"]);
    expect(mockDb.data.slot_patterns).toHaveLength(1);
    expect(mockDb.data.slot_patterns[0].day).toBe("Sunday");
  });
});
