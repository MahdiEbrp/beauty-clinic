import "server-only";

import { inArray } from "drizzle-orm";

import type { db } from "@/src/db";
import { bookingSlotGroups, bookings } from "@/src/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** An existing slot row considered for group reconciliation. */
export type ExistingSlot = {
  id: string;
  slotDate: string;
  startTime: string;
};

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

/**
 * Slot ids that already have any booking row. Booked slots are treated as
 * immutable by the generator (their capacity and group links are preserved).
 */
export async function loadBookedSlotIds(
  tx: Tx,
  slotIds: string[],
): Promise<Set<string>> {
  const booked = new Set<string>();
  if (slotIds.length === 0) return booked;
  const rows = await tx
    .select({ slotId: bookings.slotId })
    .from(bookings)
    .where(inArray(bookings.slotId, slotIds));
  for (const row of rows) if (row.slotId) booked.add(row.slotId);
  return booked;
}

/** Group ids linked to each slot, batch-loaded in one query. */
export async function loadSlotGroupLinks(
  tx: Tx,
  slotIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (slotIds.length === 0) return map;
  const rows = await tx
    .select({
      slotId: bookingSlotGroups.slotId,
      groupId: bookingSlotGroups.groupId,
    })
    .from(bookingSlotGroups)
    .where(inArray(bookingSlotGroups.slotId, slotIds));
  for (const row of rows) {
    const list = map.get(row.slotId);
    if (list) list.push(row.groupId);
    else map.set(row.slotId, [row.groupId]);
  }
  return map;
}

/** Bulk insert for freshly created slots (empty group sets add nothing). */
export async function insertSlotGroupLinks(
  tx: Tx,
  links: { slotId: string; groupId: string }[],
): Promise<void> {
  if (links.length === 0) return;
  await tx.insert(bookingSlotGroups).values(links).onConflictDoNothing();
}

/**
 * Reconciles group links on unbooked slots to their desired set. Booked slots
 * are skipped entirely; slots whose desired set is `null` are left untouched.
 * Runs as at most delete + insert over the whole batch (no per-slot queries).
 */
export async function reconcileSlotGroups(
  tx: Tx,
  slots: ExistingSlot[],
  desired: (slot: ExistingSlot) => string[] | null,
  bookedIds: Set<string>,
): Promise<void> {
  if (slots.length === 0) return;

  const current = await loadSlotGroupLinks(tx, slots.map((slot) => slot.id));
  const changes: { slotId: string; groupIds: string[] }[] = [];
  for (const slot of slots) {
    if (bookedIds.has(slot.id)) continue;
    const want = desired(slot);
    if (want === null) continue;
    if (!sameSet(want, current.get(slot.id) ?? [])) {
      changes.push({ slotId: slot.id, groupIds: want });
    }
  }
  if (changes.length === 0) return;

  await tx
    .delete(bookingSlotGroups)
    .where(inArray(bookingSlotGroups.slotId, changes.map((c) => c.slotId)));
  const links = changes.flatMap((change) =>
    change.groupIds.map((groupId) => ({ slotId: change.slotId, groupId })),
  );
  await insertSlotGroupLinks(tx, links);
}
