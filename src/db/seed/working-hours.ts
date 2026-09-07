import { inArray } from "drizzle-orm";

import { db } from "../index";
import { slotPatterns, workingHours } from "../schema";

/** One explicit (start time → seats) slot of the daily pattern. */
export type SlotPatternSeed = { startTime: string; capacity: number };

/**
 * Clinic weekly schedule — Saturday to Wednesday, 15-minute slot grid with a
 * per-time seat capacity (some windows take two clients, others one).
 * Thursday and Friday are closed (no working-hours rows).
 */
export const DEFAULT_SCHEDULE_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
] as const;

export const DEFAULT_DAY_PATTERN: SlotPatternSeed[] = [
  { startTime: "13:15", capacity: 2 },
  { startTime: "13:30", capacity: 1 },
  { startTime: "13:45", capacity: 1 },
  { startTime: "14:00", capacity: 2 },
  { startTime: "14:15", capacity: 1 },
  { startTime: "14:30", capacity: 1 },
  { startTime: "14:45", capacity: 1 },
  { startTime: "15:00", capacity: 2 },
  { startTime: "15:15", capacity: 1 },
  { startTime: "15:30", capacity: 2 },
  { startTime: "15:45", capacity: 1 },
  { startTime: "16:00", capacity: 2 },
  { startTime: "16:15", capacity: 1 },
  { startTime: "16:30", capacity: 2 },
  { startTime: "16:45", capacity: 1 },
  { startTime: "17:00", capacity: 2 },
  { startTime: "17:15", capacity: 1 },
  { startTime: "17:30", capacity: 1 },
];

/** Per-weekday working-hours rows (window only used as fallback/display). */
const DEFAULT_WH: { day: string; opens: string; closes: string; capacity: number }[] =
  DEFAULT_SCHEDULE_DAYS.map((day) => ({
    day,
    opens: "13:15",
    closes: "17:45",
    capacity: 2,
  }));

/** Seeds weekly working hours + slot patterns for fresh installs. */
export async function seedWorkingHours(): Promise<void> {
  const daySet = new Set(DEFAULT_SCHEDULE_DAYS);

  for (const [index, entry] of DEFAULT_WH.entries()) {
    await db
      .insert(workingHours)
      .values({ ...entry, displayOrder: index + 1, isActive: true })
      .onConflictDoNothing({ target: workingHours.day });
  }

  // Reconcile the pattern rows for the seeded days: drop removed starts, then
  // insert the current day pattern (idempotent upsert per (day, start_time)).
  await db
    .delete(slotPatterns)
    .where(inArray(slotPatterns.day, [...daySet]));
  if (DEFAULT_DAY_PATTERN.length > 0) {
    await db
      .insert(slotPatterns)
      .values(
        DEFAULT_SCHEDULE_DAYS.flatMap((day) =>
          DEFAULT_DAY_PATTERN.map((entry) => ({
            day,
            startTime: entry.startTime,
            capacity: entry.capacity,
          })),
        ),
      )
      .onConflictDoNothing({
        target: [slotPatterns.day, slotPatterns.startTime],
      });
  }

  console.log("Working hours + slot patterns seeded.");
}