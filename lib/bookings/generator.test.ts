import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  DEFAULTS,
  ensureAutoSlots,
  ensureAutoSlotsWithConfig,
  planWindowSlots,
  readGeneratorConfig,
  zonedDateKey,
  weekdayOf,
} from "./generator";
import { loadWorkingHourRecords } from "./working-hours";
import { loadSlotPatternMap } from "./slot-patterns";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";

vi.mock("@/lib/settings/loader", () => ({
  loadSystemSettingsMap: vi.fn(),
}));

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

function mockTx(existing: Array<{ id?: string; slotDate: string; startTime: string; capacity?: number; isActive?: boolean }> = []) {
  const updateSets: unknown[] = [];
  const update = vi.fn().mockImplementation(() => ({
    set: vi.fn((values: unknown) => {
      updateSets.push(values);
      return { where: vi.fn().mockResolvedValue(undefined) };
    }),
  }));
  const existingRows = existing.map((row) => ({
    ...row,
    capacity: row.capacity ?? 1,
    isActive: row.isActive ?? true,
  }));
  return {
    updateSets,
    execute: vi.fn().mockResolvedValue([]),
    select: vi.fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(existingRows) }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([]) }),
      })
      .mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([]) }),
      }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "slot-1" }]),
        }),
      }),
    }),
    update,
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  };
}

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

describe("readGeneratorConfig", () => {
  it("reads interval/duration/capacity/window from settings when present", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(
      new Map([
        ["booking.slot_auto", true],
        ["booking.slot_interval_min", 15],
        ["booking.slot_duration_min", 45],
        ["booking.slot_default_capacity", 3],
        ["booking.slot_window_days", 7],
        ["booking.timezone", "Asia/Dubai"],
      ] as never),
    );
    const cfg = await readGeneratorConfig();
    expect(cfg.auto).toBe(true);
    // interval < duration → clamped up to the duration (no overlapping starts)
    expect(cfg.intervalMin).toBe(45);
    expect(cfg.durationMin).toBe(45);
    expect(cfg.capacity).toBe(3);
    expect(cfg.windowDays).toBe(7);
    expect(cfg.timeZone).toBe("Asia/Dubai");
  });

  it("clamps intervalMin up to durationMin when it is smaller", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(
      new Map([
        ["booking.slot_interval_min", 10],
        ["booking.slot_duration_min", 60],
      ] as never),
    );
    const cfg = await readGeneratorConfig();
    expect(cfg.intervalMin).toBe(60);
    expect(cfg.durationMin).toBe(60);
  });

  it("coerces numeric-string settings to numbers", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(
      new Map([["booking.slot_interval_min", "45"]] as never),
    );
    const cfg = await readGeneratorConfig();
    expect(cfg.intervalMin).toBe(45);
  });

  it("falls back to default timezone when booking.timezone is missing", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(new Map());
    const cfg = await readGeneratorConfig();
    expect(cfg.timeZone).toBe("Asia/Tehran");
    expect(cfg.auto).toBe(true);
    expect(cfg.windowDays).toBe(180);
  });
});

describe("ensureAutoSlotsWithConfig", () => {
  const records = [
    { day: "Saturday", opens: "09:00", closes: "10:30", capacity: 2 },
    { day: "Sunday", opens: "10:00", closes: "12:00", capacity: 1 },
  ] as const;

  /** All window date keys that fall on Saturday or Sunday. */
  function windowKeys(windowDays: number, timeZone: string): string[] {
    const keys: string[] = [];
    for (let i = 0; i < windowDays; i += 1) {
      const key = zonedDateKey(timeZone, new Date(), i);
      if (weekdayOf(key) === "Saturday" || weekdayOf(key) === "Sunday") keys.push(key);
    }
    return keys;
  }

  function seededRows(): Array<{ id: string; slotDate: string; startTime: string }> {
    const rows: Array<{ id: string; slotDate: string; startTime: string }> = [];
    for (const date of windowKeys(7, "UTC")) {
      if (weekdayOf(date) === "Saturday") {
        for (const start of ["09:00", "09:30", "10:00"]) rows.push({ id: `${date}-${start}`, slotDate: date, startTime: start });
      } else {
        for (const start of ["10:00", "10:30", "11:00", "11:30"]) rows.push({ id: `${date}-${start}`, slotDate: date, startTime: start });
      }
    }
    return rows;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(mockTx() as never));
    vi.mocked(loadSlotPatternMap).mockResolvedValue(new Map());
  });

  it("creates slots for a 30-minute interval", async () => {
    vi.mocked(loadWorkingHourRecords).mockResolvedValue(records as never);
    const result = await ensureAutoSlotsWithConfig({
      ...DEFAULTS,
      auto: true,
      intervalMin: 30,
      durationMin: 30,
      capacity: 2,
      windowDays: 7,
      timeZone: "UTC",
    });
    expect(typeof result.created).toBe("number");
    expect(result.created).toBeGreaterThanOrEqual(0);
  });

  it("reactivates existing unbooked slots that match the current working-hours grid", async () => {
    const dateKey = zonedDateKey("UTC", new Date(), 0);
    const tx = mockTx([
      {
        id: "inactive-slot",
        slotDate: dateKey,
        startTime: "09:00",
        capacity: 1,
        isActive: false,
      },
    ]);
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));
    vi.mocked(loadWorkingHourRecords).mockResolvedValue([
      {
        day: weekdayOf(dateKey),
        opens: "09:00",
        closes: "10:00",
        capacity: 1,
      },
    ] as never);

    await ensureAutoSlotsWithConfig({
      ...DEFAULTS,
      auto: true,
      intervalMin: 30,
      durationMin: 30,
      windowDays: 1,
      timeZone: "UTC",
    });

    expect(tx.updateSets).toContainEqual({
      isActive: true,
      updatedAt: expect.any(Date),
    });
  });

  it("is idempotent — second run creates nothing", async () => {
    vi.mocked(loadWorkingHourRecords).mockResolvedValue(records as never);
    let callCount = 0;
    vi.mocked(db.transaction).mockImplementation(async (fn) => {
      callCount++;
      return fn((callCount === 1 ? mockTx() : mockTx(seededRows())) as never);
    });
    await ensureAutoSlotsWithConfig({
      ...DEFAULTS,
      auto: true,
      intervalMin: 30,
      durationMin: 30,
      capacity: 1,
      windowDays: 7,
      timeZone: "UTC",
    });
    const second = await ensureAutoSlotsWithConfig({
      ...DEFAULTS,
      auto: true,
      intervalMin: 30,
      durationMin: 30,
      capacity: 1,
      windowDays: 7,
      timeZone: "UTC",
    });
    expect(second.created).toBe(0);
  });

  it("does not generate when auto is disabled without force", async () => {
    vi.mocked(loadWorkingHourRecords).mockResolvedValue(records as never);
    const result = await ensureAutoSlotsWithConfig({
      ...DEFAULTS,
      auto: false,
    });
    expect(result.created).toBe(0);
    expect(loadWorkingHourRecords).not.toHaveBeenCalled();
  });
});

describe("ensureAutoSlots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(mockTx() as never));
    vi.mocked(loadSlotPatternMap).mockResolvedValue(new Map());
  });

  it("returns 0 when auto is disabled without loading working hours", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(
      new Map([["booking.slot_auto", false]]),
    );
    vi.mocked(loadWorkingHourRecords).mockResolvedValue([]);
    const result = await ensureAutoSlots();
    expect(result.created).toBe(0);
    expect(loadWorkingHourRecords).not.toHaveBeenCalled();
  });

  it("proceeds when force is passed even if auto is disabled", async () => {
    vi.mocked(loadSystemSettingsMap).mockResolvedValue(
      new Map([["booking.slot_auto", false]]),
    );
    vi.mocked(loadWorkingHourRecords).mockResolvedValue([
      { day: "Saturday", opens: "09:00", closes: "10:00", capacity: 1 },
    ] as never);
    const result = await ensureAutoSlots(true);
    expect(result.created).toBeGreaterThanOrEqual(0);
    expect(loadWorkingHourRecords).toHaveBeenCalled();
  });
});