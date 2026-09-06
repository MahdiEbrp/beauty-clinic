import "server-only";

import { inArray, sql } from "drizzle-orm";

import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { bookingSlots } from "@/src/db/schema";
import {
  DEFAULT_CLINIC_TIMEZONE,
  loadWorkingHourRecords,
  type WorkingHour,
} from "./working-hours";

export const SLOT_GENERATOR_KEYS = {
  auto: "booking.slot_auto",
  interval: "booking.slot_interval_min",
  duration: "booking.slot_duration_min",
  capacity: "booking.slot_default_capacity",
  window: "booking.slot_window_days",
} as const;

export type GeneratorConfig = {
  auto: boolean;
  intervalMin: number;
  durationMin: number;
  capacity: number;
  windowDays: number;
  timeZone: string;
};

export const DEFAULTS: GeneratorConfig = {
  auto: false,
  intervalMin: 30,
  durationMin: 30,
  capacity: 1,
  windowDays: 30,
  timeZone: DEFAULT_CLINIC_TIMEZONE,
};

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Resolves the generator configuration from system settings with safe defaults. */
export async function readGeneratorConfig(): Promise<GeneratorConfig> {
  const settings = await loadSystemSettingsMap();
  const intervalMin = num(
    settings.get(SLOT_GENERATOR_KEYS.interval),
    DEFAULTS.intervalMin,
  );
  const durationMin = num(
    settings.get(SLOT_GENERATOR_KEYS.duration),
    DEFAULTS.durationMin,
  );
  return {
    auto: settings.get(SLOT_GENERATOR_KEYS.auto) === true,
    // Never space slots closer together than their own duration — otherwise
    // planWindowSlots would produce overlapping starts that double-book.
    intervalMin: Math.max(intervalMin, durationMin),
    durationMin,
    capacity: num(settings.get(SLOT_GENERATOR_KEYS.capacity), DEFAULTS.capacity),
    windowDays: num(settings.get(SLOT_GENERATOR_KEYS.window), DEFAULTS.windowDays),
    timeZone:
      typeof settings.get("booking.timezone") === "string"
        ? (settings.get("booking.timezone") as string)
        : DEFAULT_CLINIC_TIMEZONE,
  };
}

/** YYYY-MM-DD for today plus an optional day offset, in the clinic's timezone. */
export function zonedDateKey(timeZone: string, date: Date, offsetDays = 0): string {
  const shifted = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(shifted);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

/** Minutes 0..1439 from an "HH:mm" (or "HH:mm:ss") time. */
function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function hhmm(minutes: number): string {
  const m = Math.min(Math.max(0, minutes), 1439);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** English weekday name for a YYYY-MM-DD wall-clock date. */
export function weekdayOf(dateKey: string): string {
  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Parse at 12:00 UTC; only the calendar weekday matters and is stable.
  return names[new Date(`${dateKey}T12:00:00Z`).getUTCDay()] ?? "";
}

/**
 * Pure plan for one day window: start times spaced `intervalMin` apart, each
 * slot lasting `durationMin`, fully contained in [opens, closes).
 */
export function planWindowSlots(
  window: WorkingHour,
  intervalMin: number,
  durationMin: number,
): string[] {
  const open = minutesOf(window.opens);
  const close = minutesOf(window.closes);
  const starts: string[] = [];
  for (let t = open; t + durationMin <= close; t += intervalMin) {
    starts.push(hhmm(t));
  }
  return starts;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Core idempotent generator run inside the caller's transaction.
 *
 * Queries existing (date, start_time) rows for the WHOLE window in one
 * batched select, then inserts every missing slot in one bulk insert, so the
 * O(days) sequential query/insert pairs collapse into 1 select + 1 insert.
 */
async function ensureAutoSlotsCore(
  tx: Tx,
  config: GeneratorConfig,
  workingHours: readonly WorkingHour[],
): Promise<number> {
  const byDay = new Map(workingHours.map((w) => [w.day, w]));

  const windowsByDate = new Map<string, WorkingHour>();
  for (let dayOffset = 0; dayOffset < config.windowDays; dayOffset += 1) {
    const dateKey = zonedDateKey(config.timeZone, new Date(), dayOffset);
    const window = byDay.get(weekdayOf(dateKey));
    if (!window) continue;
    windowsByDate.set(dateKey, window);
  }
  if (windowsByDate.size === 0) return 0;

  // One batched read of every start time already materialized in the window.
  const existingRows = await tx
    .select({ slotDate: bookingSlots.slotDate, startTime: bookingSlots.startTime })
    .from(bookingSlots)
    .where(inArray(bookingSlots.slotDate, [...windowsByDate.keys()]));
  const existingSet = new Set(
    existingRows.map((row) => `${row.slotDate}|${row.startTime}`),
  );

  const missing: (typeof bookingSlots.$inferInsert)[] = [];
  for (const [dateKey, window] of windowsByDate) {
    const starts = planWindowSlots(window, config.intervalMin, config.durationMin);
    const capacity = window.capacity > 0 ? window.capacity : config.capacity;
    for (const start of starts) {
      if (existingSet.has(`${dateKey}|${start}`)) continue;
      // Reserve the key in-window so same-day repeats don't double-count.
      existingSet.add(`${dateKey}|${start}`);
      missing.push({
        slotDate: dateKey,
        startTime: start,
        endTime: hhmm(minutesOf(start) + config.durationMin),
        capacity,
        isActive: true,
      });
    }
  }
  if (missing.length === 0) return 0;

  const rows = await tx
    .insert(bookingSlots)
    .values(missing)
    // DB-level guard: the unique (slot_date, start_time) index makes parallel
    // writers idempotent even beyond the advisory lock.
    .onConflictDoNothing({ target: [bookingSlots.slotDate, bookingSlots.startTime] })
    .returning({ id: bookingSlots.id });

  return rows.length;
}

/**
 * Materializes missing auto-slots for the configured window. Runs inside ONE
 * transaction that first takes a PostgreSQL advisory xact lock, so parallel
 * server instances/restarts never double-insert. Idempotent — existing
 * (date, start_time) rows are left untouched (never overwritten, never
 * deleted), so "slots auto-append unless an admin limited or changed hours"
 * holds by construction.
 */
export async function ensureAutoSlots(force = false): Promise<{ created: number }> {
  const config = await readGeneratorConfig();
  return ensureAutoSlotsWithConfig(config, force);
}

/**
 * Exposed for tests/admin callers that pin an explicit config. `force`
 * bypasses the `booking.slot_auto` gate so a manual admin trigger works even
 * when automatic generation is disabled.
 */
export async function ensureAutoSlotsWithConfig(
  config: GeneratorConfig,
  force = false,
): Promise<{ created: number }> {
  if (!force && !config.auto) return { created: 0 };
  const workingHours = await loadWorkingHourRecords();
  return db.transaction(async (tx) => {
    // Single-writer guard: only one generator run proceeds at a time.
    // eslint-disable-next-line no-secrets/no-secrets -- Postgres advisory lock function name, not a secret
    await tx.execute(sql`SELECT pg_advisory_xact_lock(22467)`);
    const created = await ensureAutoSlotsCore(tx, config, workingHours);
    return { created };
  });
}