import "server-only";

import { inArray } from "drizzle-orm";

import type { db } from "@/src/db";
import { bookingSlots } from "@/src/db/schema";
import type { WorkingHour } from "./working-hours";
import type { SlotPattern } from "./slot-patterns";
import {
  hhmm,
  minutesOf,
  planWindowSlots,
  weekdayOf,
  zonedDateKey,
  type GeneratorConfig,
} from "./generator-utils";
import {
  insertSlotGroupLinks,
  loadBookedSlotIds,
  reconcileSlotGroups,
  type ExistingSlot,
} from "./generator-groups";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** One day inside the generation window with the window + optional pattern. */
type DayPlan = {
  window: WorkingHour;
  pattern?: SlotPattern[];
};

type ExistingRow = {
  id: string;
  slotDate: string;
  startTime: string;
  capacity: number;
  isActive: boolean;
};

/** Desired group set for a *new* start (pattern row groups, else the fallback). */
function groupsOfStart(plan: DayPlan, start: string, fallback: string[]): string[] {
  if (!plan.pattern) return fallback;
  return plan.pattern.find((entry) => entry.startTime === start)?.groupIds ?? [];
}

/**
 * Desired group set for an already-existing slot. Returns `null` when the slot
 * is out of pattern (it is being deactivated) so its links are left untouched.
 */
function desiredGroupsForExisting(
  plans: Map<string, DayPlan>,
  config: GeneratorConfig,
): (slot: ExistingSlot) => string[] | null {
  return (slot) => {
    const plan = plans.get(slot.slotDate);
    if (!plan) return null;
    if (!plan.pattern) return config.groupIds;
    const entry = plan.pattern.find((item) => item.startTime === slot.startTime);
    return entry ? entry.groupIds : null;
  };
}

/**
 * Reconciles a pattern day's unbooked slots to its pattern rows:
 *   - booked slots are never touched (kept even if no longer in the pattern),
 *   - unbooked slots whose start left the pattern are deactivated,
 *   - unbooked slots whose capacity changed are updated in place.
 * Batched into UPDATE statements over the whole window (grouped by value).
 */
async function syncPatternCapacities(
  tx: Tx,
  patternDates: Map<string, DayPlan>,
  existingByDate: Map<string, ExistingRow[]>,
  bookedIds: Set<string>,
): Promise<void> {
  const deactivateIds: string[] = [];
  const capacityByTarget = new Map<number, string[]>();

  for (const [dateKey, plan] of patternDates) {
    const desired = new Map(
      (plan.pattern ?? []).map((entry) => [entry.startTime, entry.capacity]),
    );
    for (const row of existingByDate.get(dateKey) ?? []) {
      if (bookedIds.has(row.id)) continue;
      const targetCapacity = desired.get(row.startTime);
      if (targetCapacity === undefined) {
        if (row.isActive) deactivateIds.push(row.id);
      } else if (row.capacity !== targetCapacity) {
        const ids = capacityByTarget.get(targetCapacity);
        if (ids) ids.push(row.id);
        else capacityByTarget.set(targetCapacity, [row.id]);
      }
    }
  }

  if (deactivateIds.length > 0) {
    await tx
      .update(bookingSlots)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(bookingSlots.id, deactivateIds));
  }
  for (const [capacity, ids] of capacityByTarget) {
    await tx
      .update(bookingSlots)
      .set({ capacity, updatedAt: new Date() })
      .where(inArray(bookingSlots.id, ids));
  }
}

/**
 * Core idempotent generator run inside the caller's transaction.
 *
 * Queries existing rows for the WHOLE window in one batched select, inserts
 * every missing slot plus its group links in two bulk inserts, then reconciles
 * unbooked slots (group links on every day, capacity on pattern days). Days in
 * pattern mode use their exact time→capacity→groups rows; other days keep the
 * interval-based grid with a single day capacity and the default group set.
 */
export async function ensureAutoSlotsCore(
  tx: Tx,
  config: GeneratorConfig,
  workingHours: readonly WorkingHour[],
  patternMap: Map<string, SlotPattern[]>,
): Promise<number> {
  const byDay = new Map(workingHours.map((w) => [w.day, w]));
  const dayPlansByDate = new Map<string, DayPlan>();
  for (let dayOffset = 0; dayOffset < config.windowDays; dayOffset += 1) {
    const dateKey = zonedDateKey(config.timeZone, new Date(), dayOffset);
    const window = byDay.get(weekdayOf(dateKey));
    if (!window) continue;
    const patterns = patternMap.get(window.day);
    dayPlansByDate.set(dateKey, {
      window,
      pattern: patterns && patterns.length > 0 ? patterns : undefined,
    });
  }
  if (dayPlansByDate.size === 0) return 0;

  const dateKeys = [...dayPlansByDate.keys()];
  const existingRows = await tx
    .select({
      id: bookingSlots.id,
      slotDate: bookingSlots.slotDate,
      startTime: bookingSlots.startTime,
      capacity: bookingSlots.capacity,
      isActive: bookingSlots.isActive,
    })
    .from(bookingSlots)
    .where(inArray(bookingSlots.slotDate, dateKeys));
  const existingSet = new Set(
    existingRows.map((row) => `${row.slotDate}|${row.startTime}`),
  );
  const existingByDate = new Map<string, ExistingRow[]>();
  for (const row of existingRows) {
    const list = existingByDate.get(row.slotDate);
    if (list) list.push(row);
    else existingByDate.set(row.slotDate, [row]);
  }

  const bookedIds = await loadBookedSlotIds(
    tx,
    existingRows.map((row) => row.id),
  );

  const missing: (typeof bookingSlots.$inferInsert & { groupIds: string[] })[] = [];
  for (const [dateKey, plan] of dayPlansByDate) {
    const { window } = plan;
    const starts = plan.pattern
      ? plan.pattern.map((entry) => entry.startTime)
      : planWindowSlots(window, config.intervalMin, config.durationMin);
    const capacityOf = (start: string) =>
      plan.pattern
        ? plan.pattern.find((entry) => entry.startTime === start)?.capacity ?? config.capacity
        : window.capacity > 0
          ? window.capacity
          : config.capacity;
    for (const start of starts) {
      if (existingSet.has(`${dateKey}|${start}`)) continue;
      existingSet.add(`${dateKey}|${start}`);
      missing.push({
        slotDate: dateKey,
        startTime: start,
        endTime: hhmm(minutesOf(start) + config.durationMin),
        capacity: capacityOf(start),
        isActive: true,
        groupIds: groupsOfStart(plan, start, config.groupIds),
      });
    }
  }

  let created = 0;
  if (missing.length > 0) {
    const rows = await tx
      .insert(bookingSlots)
      .values(
        missing.map((item) => ({
          slotDate: item.slotDate,
          startTime: item.startTime,
          endTime: item.endTime,
          capacity: item.capacity,
          isActive: item.isActive,
        })),
      )
      .onConflictDoNothing({ target: [bookingSlots.slotDate, bookingSlots.startTime] })
      .returning({
        id: bookingSlots.id,
        slotDate: bookingSlots.slotDate,
        startTime: bookingSlots.startTime,
      });
    created = rows.length;

    const groupsByKey = new Map(
      missing.map((item) => [`${item.slotDate}|${item.startTime}`, item.groupIds]),
    );
    await insertSlotGroupLinks(
      tx,
      rows.flatMap((row) =>
        (groupsByKey.get(`${row.slotDate}|${row.startTime}`) ?? []).map((groupId) => ({
          slotId: row.id,
          groupId,
        })),
      ),
    );
  }

  const patternDates = new Map<string, DayPlan>();
  for (const [dateKey, plan] of dayPlansByDate) {
    if (plan.pattern) patternDates.set(dateKey, plan);
  }
  if (patternDates.size > 0) {
    await syncPatternCapacities(tx, patternDates, existingByDate, bookedIds);
  }

  await reconcileSlotGroups(
    tx,
    existingRows.map((row) => ({
      id: row.id,
      slotDate: row.slotDate,
      startTime: row.startTime,
    })),
    desiredGroupsForExisting(dayPlansByDate, config),
    bookedIds,
  );

  return created;
}
