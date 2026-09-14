import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  DEFAULTS,
  ensureAutoSlotsWithConfig,
  zonedDateKey,
  weekdayOf,
} from "./generator";
import { loadWorkingHourRecords } from "./working-hours";
import { loadSlotPatternMap } from "./slot-patterns";
import { db } from "@/src/db";

vi.mock("./working-hours", () => ({
  loadWorkingHourRecords: vi.fn(),
  DEFAULT_CLINIC_TIMEZONE: "Asia/Tehran",
}));

vi.mock("./slot-patterns", () => ({
  loadSlotPatternMap: vi.fn(),
}));

vi.mock("@/src/db", () => ({
  db: {
    transaction: vi.fn(),
  },
}));

const records = [
  { day: "Saturday", opens: "09:00", closes: "18:00", capacity: 1 },
] as const;

const config = {
  ...DEFAULTS,
  auto: true,
  intervalMin: 15,
  durationMin: 15,
  capacity: 1,
  windowDays: 21,
  timeZone: "UTC",
};

/** Date keys inside the window that fall on Saturday (the only open day). */
function saturdayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < config.windowDays; i += 1) {
    const key = zonedDateKey("UTC", new Date(), i);
    if (weekdayOf(key) === "Saturday") keys.push(key);
  }
  return keys;
}

type SlotRow = { id: string; slotDate: string; startTime: string; capacity: number; isActive: boolean };

function runWithTx(tx: unknown): void {
  vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));
}

function baseTx(existing: SlotRow[], booked: string[]) {
  const updateSets: Array<Record<string, unknown>> = [];
  const tx = {
    execute: vi.fn().mockResolvedValue([]),
    select: vi.fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(existing) }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(booked.map((slotId) => ({ slotId }))),
        }),
      })
      .mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([]) }),
      }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: (setValue: Record<string, unknown>) => ({
        where: () => {
          updateSets.push(setValue);
          return Promise.resolve();
        },
      }),
    }),
  };
  return { tx, updateSets };
}

describe("ensureAutoSlotsWithConfig with slot patterns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadWorkingHourRecords).mockResolvedValue(records as never);
  });

  it("materializes exactly the pattern rows with their own capacities", async () => {
    vi.mocked(loadSlotPatternMap).mockResolvedValue(
      new Map([
        [
          "Saturday",
          [
            { day: "Saturday", startTime: "13:15", capacity: 2, groupIds: [] },
            { day: "Saturday", startTime: "13:30", capacity: 1, groupIds: [] },
            { day: "Saturday", startTime: "17:30", capacity: 2, groupIds: [] },
          ],
        ],
      ]),
    );
    const inserted: Array<Record<string, unknown>> = [];
    const tx = {
      execute: vi.fn().mockResolvedValue([]),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([]) }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn((values: unknown[]) => {
          inserted.push(...(values as Array<Record<string, unknown>>));
          return {
            onConflictDoNothing: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue(values.map(() => ({ id: "slot" }))),
            }),
          };
        }),
      }),
      update: vi.fn(),
    };
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));

    const satCount = saturdayKeys().length;
    const result = await ensureAutoSlotsWithConfig(config);

    expect(result.created).toBe(satCount * 3);
    expect(inserted).toHaveLength(satCount * 3);
    const caps = new Map(
      inserted.map((row) => [row.startTime, row.capacity] as const),
    );
    expect([...caps.keys()].sort()).toEqual(["13:15", "13:30", "17:30"]);
    expect(caps.get("13:15")).toBe(2);
    expect(caps.get("13:30")).toBe(1);
    expect(caps.get("17:30")).toBe(2);
  });

  it("never touches booked slots: only deactivates unbooked removed starts", async () => {
    const keys = saturdayKeys();
    const existing: SlotRow[] = keys.flatMap((dateKey) => [
      { id: `a-${dateKey}`, slotDate: dateKey, startTime: "12:00", capacity: 1, isActive: true },
      { id: `b-${dateKey}`, slotDate: dateKey, startTime: "13:15", capacity: 1, isActive: true },
      { id: `c-${dateKey}`, slotDate: dateKey, startTime: "14:00", capacity: 1, isActive: true },
      { id: `d-${dateKey}`, slotDate: dateKey, startTime: "17:30", capacity: 2, isActive: true },
    ]);
    const booked = keys.flatMap((dateKey) => [`b-${dateKey}`, `d-${dateKey}`]);

    vi.mocked(loadSlotPatternMap).mockResolvedValue(
      new Map([
        [
          "Saturday",
          [
            { day: "Saturday", startTime: "13:15", capacity: 5, groupIds: [] },
            { day: "Saturday", startTime: "17:30", capacity: 2, groupIds: [] },
          ],
        ],
      ]),
    );

    const harness = baseTx(existing, booked);
    runWithTx(harness.tx);

    const result = await ensureAutoSlotsWithConfig(config);

    expect(result.created).toBe(0);
    // b-* (booked) must NOT be raised to capacity 5 and d-* (booked) must not
    // be re-updated — only the unbooked a-* + c-* rows get deactivated.
    expect(harness.updateSets).toHaveLength(1);
    expect(harness.updateSets[0]).toMatchObject({ isActive: false });
  });

  it("updates unbooked slot capacities to match the pattern", async () => {
    const keys = saturdayKeys();
    const existing: SlotRow[] = keys.flatMap((dateKey) => [
      { id: `b-${dateKey}`, slotDate: dateKey, startTime: "13:15", capacity: 1, isActive: true },
      { id: `d-${dateKey}`, slotDate: dateKey, startTime: "17:30", capacity: 2, isActive: true },
    ]);

    vi.mocked(loadSlotPatternMap).mockResolvedValue(
      new Map([
        [
          "Saturday",
          [
            { day: "Saturday", startTime: "13:15", capacity: 2, groupIds: [] },
            { day: "Saturday", startTime: "17:30", capacity: 2, groupIds: [] },
          ],
        ],
      ]),
    );

    const harness = baseTx(existing, []);
    runWithTx(harness.tx);

    const result = await ensureAutoSlotsWithConfig(config);

    expect(result.created).toBe(0);
    expect(harness.updateSets).toHaveLength(1);
    expect(harness.updateSets[0]).toMatchObject({ capacity: 2 });
  });
});
