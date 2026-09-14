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

type SlotRow = {
  id: string;
  slotDate: string;
  startTime: string;
  capacity: number;
  isActive: boolean;
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

function runWithTx(tx: unknown): void {
  vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));
}

/** Tx harness that separates slot inserts from group-link inserts. */
function captureTx(opts: {
  existing?: SlotRow[];
  booked?: string[];
  links?: Array<{ slotId: string; groupId: string }>;
}) {
  const existing = opts.existing ?? [];
  const booked = opts.booked ?? [];
  const links = opts.links ?? [];
  const slotInserts: Array<Record<string, unknown>> = [];
  const linkInserts: Array<Record<string, unknown>> = [];

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
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(links) }),
      })
      .mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([]) }),
      }),
    insert: vi.fn().mockImplementation(() => ({
      values: (values: Record<string, unknown>[]) => {
        const isLinks = values.length > 0 && "groupId" in (values[0] ?? {});
        (isLinks ? linkInserts : slotInserts).push(...values);
        return {
          onConflictDoNothing: () => ({
            returning: () =>
              Promise.resolve(
                isLinks
                  ? values
                  : values.map((value, index) => ({
                      id: `slot-${index}`,
                      slotDate: value.slotDate,
                      startTime: value.startTime,
                    })),
              ),
          }),
        };
      },
    })),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  };
  return { tx, slotInserts, linkInserts };
}

describe("group-aware generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadWorkingHourRecords).mockResolvedValue(records as never);
  });

  it("links newly created slots to their pattern groups", async () => {
    vi.mocked(loadSlotPatternMap).mockResolvedValue(
      new Map([
        [
          "Saturday",
          [
            { day: "Saturday", startTime: "13:15", capacity: 2, groupIds: ["g1", "g2"] },
            { day: "Saturday", startTime: "13:30", capacity: 1, groupIds: [] },
          ],
        ],
      ]),
    );
    const harness = captureTx({});
    runWithTx(harness.tx);

    const satCount = saturdayKeys().length;
    const result = await ensureAutoSlotsWithConfig(config);

    expect(result.created).toBe(satCount * 2);
    expect(harness.slotInserts).toHaveLength(satCount * 2);
    // Only the 13:15 row is group-restricted, so exactly 2 links per day.
    expect(harness.linkInserts).toHaveLength(satCount * 2);
    expect(new Set(harness.linkInserts.map((link) => link.groupId))).toEqual(
      new Set(["g1", "g2"]),
    );
  });

  it("applies the global default groups to uniform days", async () => {
    vi.mocked(loadSlotPatternMap).mockResolvedValue(new Map());
    const harness = captureTx({});
    runWithTx(harness.tx);

    await ensureAutoSlotsWithConfig({ ...config, groupIds: ["g1"] });

    expect(harness.slotInserts.length).toBeGreaterThan(0);
    expect(harness.linkInserts).toHaveLength(harness.slotInserts.length);
    expect(harness.linkInserts.every((link) => link.groupId === "g1")).toBe(true);
  });

  it("replaces links on unbooked slots and leaves booked ones untouched", async () => {
    const keys = saturdayKeys();
    const existing: SlotRow[] = keys.flatMap((key) => [
      { id: `a-${key}`, slotDate: key, startTime: "13:15", capacity: 2, isActive: true },
      { id: `b-${key}`, slotDate: key, startTime: "17:30", capacity: 2, isActive: true },
    ]);
    const booked = keys.map((key) => `b-${key}`);
    const links = keys.flatMap((key) => [
      { slotId: `a-${key}`, groupId: "gOld" },
      { slotId: `b-${key}`, groupId: "gKeep" },
    ]);

    vi.mocked(loadSlotPatternMap).mockResolvedValue(
      new Map([
        [
          "Saturday",
          [
            { day: "Saturday", startTime: "13:15", capacity: 2, groupIds: ["g1"] },
            { day: "Saturday", startTime: "17:30", capacity: 2, groupIds: ["g2"] },
          ],
        ],
      ]),
    );
    const harness = captureTx({ existing, booked, links });
    runWithTx(harness.tx);

    const result = await ensureAutoSlotsWithConfig(config);

    expect(result.created).toBe(0);
    expect(harness.tx.delete).toHaveBeenCalledTimes(1);
    expect(harness.linkInserts).toEqual(
      keys.map((key) => ({ slotId: `a-${key}`, groupId: "g1" })),
    );
  });
});
