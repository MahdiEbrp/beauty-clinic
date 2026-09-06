import "server-only";

import { eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { slotPatterns } from "@/src/db/schema";

/** A persisted slot-pattern entry (start time + seat capacity). */
export type SlotPatternSeed = {
  startTime: string;
  capacity: number;
};

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Replaces every pattern row of a weekday with the given entries (in-tx). */
export async function replaceDayPatterns(
  tx: Tx,
  day: string,
  patterns: SlotPatternSeed[],
): Promise<void> {
  await tx.delete(slotPatterns).where(eq(slotPatterns.day, day));
  if (patterns.length === 0) return;
  await tx
    .insert(slotPatterns)
    .values(
      patterns.map((pattern) => ({
        day,
        startTime: pattern.startTime,
        capacity: pattern.capacity,
      })),
    )
    .onConflictDoNothing({ target: [slotPatterns.day, slotPatterns.startTime] });
}

/** Removes every pattern row of the given weekdays (standalone query). */
export async function deletePatternsForDays(days: string[]): Promise<void> {
  if (days.length === 0) return;
  await db.delete(slotPatterns).where(inArray(slotPatterns.day, days));
}

export function sortPatterns(patterns: SlotPatternSeed[]): SlotPatternSeed[] {
  return [...patterns].sort((a, b) =>
    a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
  );
}

/** Rejects a pattern start that cannot fit the configured slot duration. */
export async function guardPatternWithinDay(
  patterns: SlotPatternSeed[],
): Promise<void> {
  if (patterns.length === 0) return;
  const { readGeneratorConfig } = await import("./generator");
  const { durationMin } = await readGeneratorConfig();
  for (const pattern of patterns) {
    const [hour, minute] = pattern.startTime.split(":").map(Number);
    if ((hour || 0) * 60 + (minute || 0) + durationMin > 1439) {
      throw new ApiError(
        400,
        "PATTERN_TOO_LATE",
        `Pattern start ${pattern.startTime} is too late for a ${durationMin} minute slot.`,
      );
    }
  }
}

/**
 * Best-effort re-materialization so a saved pattern immediately reshapes the
 * unbooked slots inside the generation window. Failures are swallowed — the
 * daily cron retries the same idempotent run.
 */
export async function refreshPatternSlots(): Promise<void> {
  try {
    const { ensureAutoSlots } = await import("./generator");
    await ensureAutoSlots(true);
  } catch {
    /* best-effort — the daily cron covers it */
  }
}