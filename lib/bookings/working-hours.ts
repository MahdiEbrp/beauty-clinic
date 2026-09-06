import "server-only";

import { cache } from "react";
import { asc } from "drizzle-orm";

import { cacheWrap, cacheDel } from "@/lib/cache";
import { db } from "@/src/db";
import { workingHours } from "@/src/db/schema";

/** Clinic default IANA timezone used when the `booking.timezone` setting is absent. */
export const DEFAULT_CLINIC_TIMEZONE = "Asia/Tehran";

/** Canonical Sunday-first weekday order, matching the booking calendar. */
export const EN_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** A single per-day working-hours record. */
export type WorkingHour = {
  day: string;
  opens: string;
  closes: string;
  /** Default seat capacity for slots generated in this window. */
  capacity: number;
};

/** Consecutive weekdays sharing the same window, grouped for the UI/consumers. */
export type WorkingHoursGroup = {
  days: string[];
  opens: string;
  closes: string;
  capacity: number;
};

/** The row shape persisted in the `working_hours` table. */
type WorkingHoursRow = typeof workingHours.$inferSelect;

/** Fallback windows used when the table is empty or unavailable. */
const DEFAULT_WORKING_HOURS: WorkingHour[] = [
  { day: "Saturday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Sunday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Monday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Tuesday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Wednesday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Thursday", opens: "09:00", closes: "14:00", capacity: 1 },
];

export const WORKING_HOURS_CACHE_KEY = "working:hours";

/** Bust the cached working-hours set after any admin mutation. */
export async function bustWorkingHoursCache(): Promise<void> {
  await cacheDel(WORKING_HOURS_CACHE_KEY);
}

/** Converts a `working_hours` row into the canonical record shape. */
function toWorkingHour(row: WorkingHoursRow): WorkingHour {
  return {
    day: row.day,
    opens: row.opens.slice(0, 5),
    closes: row.closes.slice(0, 5),
    capacity: row.capacity,
  };
}

/**
 * Groups per-day records into consecutive runs that share the same
 * `opens`/`closes`/`capacity`. The week is treated as a ring (Sat→Sun are
 * adjacent), so a Sat–Wed run collapses into one group. Days within a group
 * are listed in cyclic order starting after the largest internal gap (so a
 * Sat–Wed block reads Sat,Sun,Mon,…), and groups are ordered Sunday-first.
 */
export function groupWorkingHours(records: readonly WorkingHour[]): WorkingHoursGroup[] {
  const order = new Map<string, number>(EN_WEEKDAYS.map((day, index) => [day, index]));
  const RING = EN_WEEKDAYS.length;

  // Bucket records by identical window key.
  const byKey = new Map<string, WorkingHour[]>();
  for (const record of records) {
    const key = `${record.opens}|${record.closes}|${record.capacity}`;
    const list = byKey.get(key);
    if (list) list.push(record);
    else byKey.set(key, [record]);
  }

  const groups: WorkingHoursGroup[] = [];

  for (const list of byKey.values()) {
    // Indices present for this window, sorted.
    const idxs = list
      .map((r) => order.get(r.day) ?? -1)
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    const present = new Set(idxs);

    // Connected components via cyclic adjacency (mod 7).
    const used = new Set<number>();
    for (const start of idxs) {
      if (used.has(start)) continue;
      const comp: number[] = [start];
      used.add(start);
      // Extend forward (stop on a gap or when the ring wraps back to the start).
      let cur = start;
      for (;;) {
        const next = (cur + 1) % RING;
        if (present.has(next) && !comp.includes(next)) {
          comp.push(next);
          used.add(next);
          cur = next;
        } else break;
      }
      // Extend backward.
      let back = start;
      for (;;) {
        const prev = (back - 1 + RING) % RING;
        if (present.has(prev) && !comp.includes(prev)) {
          comp.unshift(prev);
          used.add(prev);
          back = prev;
        } else break;
      }

      // Order days in cyclic order starting after the largest gap (so a
      // running block like Sat..Wed reads naturally, not split at the wrap).
      if (comp.length > 1) {
        let gapAt = -1;
        let maxGap = -1;
        for (let col = 0; col < comp.length; col += 1) {
          const diff = (comp[(col + 1) % comp.length] - comp[col] + RING) % RING;
          if (diff > maxGap) {
            maxGap = diff;
            gapAt = col;
          }
        }
        if (gapAt >= 0) {
          const k = (gapAt + 1) % comp.length;
          comp.push(...comp.splice(0, k));
        }
      }

      const first = list.find((r) => order.get(r.day) === comp[0]) ?? list[0];
      groups.push({
        days: comp.map((i) => EN_WEEKDAYS[i]),
        opens: first.opens,
        closes: first.closes,
        capacity: first.capacity,
      });
    }
  }

  groups.sort((a, b) => (order.get(a.days[0] ?? "") ?? 99) - (order.get(b.days[0] ?? "") ?? 99));
  return groups;
}

/** Queries the `working_hours` table fresh (no cache). */
async function loadWorkingHoursRaw(): Promise<WorkingHour[]> {
  const rows = await db
    .select()
    .from(workingHours)
    .orderBy(asc(workingHours.displayOrder), asc(workingHours.day));
  return rows.filter((row) => row.isActive).map(toWorkingHour);
}

/**
 * Per-day working hours from the DB, cached as near-static data. Falls back to
 * the compiled defaults whenever the table is empty or the query fails, so slow
 * reads/public renders never hard-crash on a missing migration.
 */
export const loadWorkingHourRecords = cache(async (): Promise<WorkingHour[]> => {
  try {
    const records = await cacheWrap(WORKING_HOURS_CACHE_KEY, 600, loadWorkingHoursRaw);
    return records.length > 0 ? records : DEFAULT_WORKING_HOURS;
  } catch {
    return DEFAULT_WORKING_HOURS;
  }
});

/** Grouped working hours (the shape existing consumers expect). */
export async function loadWorkingHours(): Promise<WorkingHoursGroup[]> {
  const records = await loadWorkingHourRecords();
  return groupWorkingHours(records);
}

/** Timezone helper: the clinic's wall-clock date (YYYY-MM-DD) right now. */
export function zonedTodayKey(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

/** Timezone helper: minutes since midnight in the clinic's wall clock. */
export function zonedNowMinutes(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (hour || 0) * 60 + (minute || 0);
}