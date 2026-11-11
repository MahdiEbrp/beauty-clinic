import "server-only";

import { eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { bustSlotPatternCache } from "./slot-patterns";
import {
  deletePatternsForDays,
  guardPatternWithinDay,
  refreshPatternSlots,
  replaceDayPatterns,
  sortPatterns,
  type SlotPatternSeed,
} from "./slot-patterns-admin";
import { db } from "@/src/db";
import { slotPatternGroups, slotPatterns, workingHours } from "@/src/db/schema";
import { bustWorkingHoursCache } from "./working-hours";
import {
  toRow,
  type WorkingHoursAdminRow,
  type WorkingHoursFilters,
  type WorkingHoursListResult,
  type WorkingHoursListRow,
} from "./working-hours-list";

export type {
  WorkingHoursAdminRow,
  WorkingHoursFilters,
  WorkingHoursListResult,
  WorkingHoursListRow,
};
export { findWorkingHourIds, listWorkingHoursAdmin } from "./working-hours-list";

/** A persisted slot-pattern entry (start time + seat capacity). */
export type { SlotPatternSeed } from "./slot-patterns-admin";

/** Sets active/inactive on a set of working-hours rows in one query. */
export async function setWorkingHoursActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(workingHours)
    .set({ isActive, updatedAt: new Date() })
    .where(inArray(workingHours.id, ids));
  await bustWorkingHoursCache();
  await refreshPatternSlots();
}

/** Bulk-deletes working-hours rows along with their day patterns. */
export async function deleteWorkingHours(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const days = (
    await db
      .select({ day: workingHours.day })
      .from(workingHours)
      .where(inArray(workingHours.id, ids))
  ).map((row) => row.day);
  await db.delete(workingHours).where(inArray(workingHours.id, ids));
  await deletePatternsForDays(days);
  await bustWorkingHoursCache();
  await bustSlotPatternCache();
  await refreshPatternSlots();
  return [];

export async function getWorkingHour(
  id: string,
): Promise<(WorkingHoursAdminRow & { patterns: SlotPatternSeed[] }) | null> {
  const [row] = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.id, id))
    .limit(1);
  if (!row) return null;
  const patternRows = await db
    .select({
      id: slotPatterns.id,
      startTime: slotPatterns.startTime,
      capacity: slotPatterns.capacity,
    })
    .from(slotPatterns)
    .where(eq(slotPatterns.day, row.day))
    .orderBy(slotPatterns.startTime);

  // One batched link query for the whole day (no per-row lookups).
  const links =
    patternRows.length === 0
      ? []
      : await db
          .select({
            patternId: slotPatternGroups.patternId,
            groupId: slotPatternGroups.groupId,
          })
          .from(slotPatternGroups)
          .where(
            inArray(
              slotPatternGroups.patternId,
              patternRows.map((pattern) => pattern.id),
            ),
          );
  const byPattern = new Map<string, string[]>();
  for (const link of links) {
    const list = byPattern.get(link.patternId);
    if (list) list.push(link.groupId);
    else byPattern.set(link.patternId, [link.groupId]);
  }

  return {
    ...toRow(row),
    patterns: patternRows.map((pattern) => ({
      startTime: pattern.startTime.slice(0, 5),
      capacity: pattern.capacity,
      groupIds: byPattern.get(pattern.id) ?? [],
    })),
  };
}

/**
 * Creates one working-hours row. Day is unique — a second entry for the same
 * weekday is rejected with a clean 409 instead of a unique-violation 500.
 * A non-empty `patterns` array activates that day's pattern mode and a
 * best-effort re-materialization of the slot window runs right after commit.
 */
export async function createWorkingHour(input: {
  day: string;
  opens: string;
  closes: string;
  capacity: number;
  displayOrder: number;
  isActive: boolean;
  patterns?: SlotPatternSeed[];
}): Promise<WorkingHoursAdminRow> {
  const sorted = sortPatterns(input.patterns ?? []);
  await guardPatternWithinDay(sorted);
  const row = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(workingHours)
      .values({
        day: input.day,
        opens: input.opens,
        closes: input.closes,
        capacity: input.capacity,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      })
      .onConflictDoNothing({ target: workingHours.day })
      .returning();
    if (!created) {
      throw new ApiError(
        409,
        "DAY_EXISTS",
        "Working hours already exist for this day.",
      );
    }
    await replaceDayPatterns(tx, created.day, sorted);
    return created;
  });
  await bustWorkingHoursCache();
  await bustSlotPatternCache();
  await refreshPatternSlots();
  return toRow(row);
}

/** Updates a working-hours row. The day itself is immutable. */
export async function updateWorkingHour(
  id: string,
  patch: {
    opens?: string;
    closes?: string;
    capacity?: number;
    displayOrder?: number;
    isActive?: boolean;
    patterns?: SlotPatternSeed[];
  },
): Promise<WorkingHoursAdminRow> {
  const { patterns, ...fields } = patch;
  if (patterns !== undefined) await guardPatternWithinDay(patterns);
  const row = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(workingHours)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(workingHours.id, id))
      .returning();
    if (!updated) {
      throw new ApiError(404, "WORKING_HOURS_NOT_FOUND", "Working hours not found.");
    }
    if (patterns !== undefined) {
      await replaceDayPatterns(tx, updated.day, sortPatterns(patterns));
    }
    return updated;
  });
  await bustWorkingHoursCache();
  await bustSlotPatternCache();
  // Re-materialize after every schedule change so generated starts stay in sync.
  await refreshPatternSlots();
  return toRow(row);
}

export async function deleteWorkingHour(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .delete(workingHours)
      .where(eq(workingHours.id, id))
      .returning({ id: workingHours.id, day: workingHours.day });
    if (!row) {
      throw new ApiError(404, "WORKING_HOURS_NOT_FOUND", "Working hours not found.");
    }
    await tx.delete(slotPatterns).where(eq(slotPatterns.day, row.day));
  });
  await bustWorkingHoursCache();
  await bustSlotPatternCache();
  await refreshPatternSlots();
}
