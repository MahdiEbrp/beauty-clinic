import "server-only";

import { eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { slotPatternGroups, slotPatterns } from "@/src/db/schema";

/** A persisted slot-pattern entry (start time + seat capacity + groups). */
export type SlotPatternSeed = {
  startTime: string;
  capacity: number;
  /** Linked service groups; empty/omitted = the generated slot accepts all. */
  groupIds?: string[];
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

  const rows = await tx
    .insert(slotPatterns)
    .values(
      patterns.map((pattern) => ({
        day,
        startTime: pattern.startTime,
        capacity: pattern.capacity,
      })),
    )
    .onConflictDoNothing({ target: [slotPatterns.day, slotPatterns.startTime] })
    .returning({ id: slotPatterns.id, startTime: slotPatterns.startTime });

  // Returned times are "HH:MM:SS"; normalize to match the "HH:MM" seeds.
  const idByStart = new Map(rows.map((row) => [row.startTime.slice(0, 5), row.id]));
  const links = patterns.flatMap((pattern) => {
    const patternId = idByStart.get(pattern.startTime);
    if (!patternId) return [];
    return (pattern.groupIds ?? []).map((groupId) => ({ patternId, groupId }));
  });
  if (links.length > 0) {
    await tx.insert(slotPatternGroups).values(links).onConflictDoNothing();
  }
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