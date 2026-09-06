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
  ensureAutoSlots: () => ({ created: 0 }),
}));

import { db } from "@/src/db";
import {
  createWorkingHour,
  deleteWorkingHour,
  deleteWorkingHours,
  findWorkingHourIds,
  getWorkingHour,
  listWorkingHoursAdmin,
  setWorkingHoursActive,
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

describe("createWorkingHour", () => {
  it("inserts a row and trims times to HH:MM", async () => {
    const row = await createWorkingHour({
      day: "Saturday",
      opens: "09:00",
      closes: "18:30",
      capacity: 3,
      displayOrder: 1,
      isActive: true,
    });
    expect(row.opens).toBe("09:00");
    expect(row.closes).toBe("18:30");
    expect(row.capacity).toBe(3);
    expect(mockDb.data.working_hours).toHaveLength(1);
  });

  it("rejects a second row for the same day with 409", async () => {
    mockDb.seed("working_hours", [makeRecord({ day: "Sunday" })]);
    await expect(
      createWorkingHour({
        day: "Sunday",
        opens: "10:00",
        closes: "14:00",
        capacity: 1,
        displayOrder: 0,
        isActive: true,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "DAY_EXISTS",
    });
    expect(mockDb.data.working_hours).toHaveLength(1);
  });
});

describe("updateWorkingHour", () => {
  it("patches scalar fields and keeps the day immutable", async () => {
    const id = randomUUID();
    mockDb.seed("working_hours", [makeRecord({ id, day: "Wednesday" })]);
    const row = await updateWorkingHour(id, {
      opens: "08:30",
      closes: "16:00",
      capacity: 4,
      isActive: false,
    });
    expect(row.opens).toBe("08:30");
    expect(row.closes).toBe("16:00");
    expect(row.capacity).toBe(4);
    expect(row.isActive).toBe(false);
  });

  it("throws 404 when the row does not exist", async () => {
    await expect(
      updateWorkingHour(randomUUID(), { displayOrder: 5 }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("deleteWorkingHour", () => {
  it("removes the row", async () => {
    const id = randomUUID();
    mockDb.seed("working_hours", [makeRecord({ id })]);
    await deleteWorkingHour(id);
    expect(mockDb.data.working_hours).toHaveLength(0);
  });

  it("throws 404 when the row does not exist", async () => {
    await expect(deleteWorkingHour(randomUUID())).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("listWorkingHoursAdmin", () => {
  it("paginates and returns totals", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ day: "Monday", displayOrder: 0 }),
      makeRecord({ day: "Tuesday", displayOrder: 1 }),
      makeRecord({ day: "Wednesday", displayOrder: 2 }),
    ]);
    const result = await listWorkingHoursAdmin({
      page: 1,
      perPage: 2,
    });
    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(2);
  });

  it("filters by status and search", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ day: "Monday", isActive: true, displayOrder: 0 }),
      makeRecord({ day: "Tuesday", isActive: false, displayOrder: 1 }),
    ]);
    const active = await listWorkingHoursAdmin({
      page: 1,
      perPage: 10,
      status: "active",
    });
    expect(active.items.map((r) => r.day)).toEqual(["Monday"]);

    const search = await listWorkingHoursAdmin({
      page: 1,
      perPage: 10,
      search: "Tues",
    });
    expect(search.items.map((r) => r.day)).toEqual(["Tuesday"]);
  });
});

describe("getWorkingHour", () => {
  it("returns the row or null", async () => {
    const id = randomUUID();
    mockDb.seed("working_hours", [makeRecord({ id })]);
    const found = await getWorkingHour(id);
    expect(found?.day).toBe("Monday");
    expect(await getWorkingHour(randomUUID())).toBeNull();
  });
});

describe("bulk operations", () => {
  it("findWorkingHourIds honors status filters", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ id: "a", isActive: true }),
      makeRecord({ id: "b", isActive: false }),
    ]);
    const ids = await findWorkingHourIds({ status: "inactive" });
    expect(ids).toEqual(["b"]);
  });

  it("setWorkingHoursActive flips a set of rows", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ id: "a", isActive: true }),
      makeRecord({ id: "b", isActive: true }),
    ]);
    await setWorkingHoursActive(["b"], false);
    const rows = mockDb.data.working_hours;
    expect(rows.find((r) => r.id === "b")?.isActive).toBe(false);
    expect(rows.find((r) => r.id === "a")?.isActive).toBe(true);
  });

  it("deleteWorkingHours removes all targeted rows", async () => {
    mockDb.seed("working_hours", [
      makeRecord({ id: "a" }),
      makeRecord({ id: "b" }),
      makeRecord({ id: "c" }),
    ]);
    const blocked = await deleteWorkingHours(["a", "b"]);
    expect(blocked).toEqual([]);
    expect(mockDb.data.working_hours).toHaveLength(1);
  });
});
describe("slot patterns", () => {
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
      { startTime: "13:15", capacity: 2 },
      { startTime: "13:30", capacity: 1 },
      { startTime: "17:30", capacity: 2 },
    ]);
  });

  it("update with empty patterns clears the day's pattern", async () => {
    mockDb.seed("working_hours", [makeRecord({ id: "wh", day: "Sunday" })]);
    mockDb.seed("slot_patterns", [
      { id: randomUUID(), day: "Sunday", start_time: "13:15:00", capacity: 1 },
    ]);
    await updateWorkingHour("wh", {
      patterns: [],
    });
    expect(mockDb.data.slot_patterns ?? []).toHaveLength(0);
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
