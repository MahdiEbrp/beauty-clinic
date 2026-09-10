import "server-only";

import { and, inArray, lte } from "drizzle-orm";

import { db } from "@/src/db";
import { bookings } from "@/src/db/schema";

/**
 * Marks every paid/waiting booking whose appointment window has fully elapsed
 * (`slot_end <= now`) as done. Used by the book-complete cron so reservations
 * auto-finish once the day passes.
 *
 * Two sequential queries only: resolve the matching ids, then a single batched
 * UPDATE — cheap on the pool and avoids any per-row N+1.
 */
export async function completePassedBookings(): Promise<{ completed: number }> {
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        inArray(bookings.status, ["paid", "waiting"]),
        lte(bookings.slotEnd, new Date()),
      ),
    )
    .limit(500);

  if (rows.length === 0) return { completed: 0 };

  const updated = await db
    .update(bookings)
    .set({ status: "done", updatedAt: new Date() })
    .where(inArray(bookings.id, rows.map((r) => r.id)))
    .returning({ id: bookings.id });

  return { completed: updated.length };
}