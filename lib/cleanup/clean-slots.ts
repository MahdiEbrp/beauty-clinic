import { db } from "@/src/db";
import { bookingSlots, bookings } from "@/src/db/schema";
import { and, notInArray, sql } from "drizzle-orm";
import { logInfo, logError } from "@/lib/log";

/**
 * Clean up unreserved past booking slots.
 * Deletes slots where:
 * - slotDate is in the past (before today)
 * - slot is not referenced by any booking (unreserved)
 */
export async function cleanUnreservedPastSlots(): Promise<number> {
  try {
    // Delete past slots that have no bookings — scoped by time + NOT IN authoritative table
    const result = await db
      .delete(bookingSlots)
      .where(
        and(
          sql`${bookingSlots.slotDate} < CURRENT_DATE`,
          notInArray(
            bookingSlots.id,
            db.select({ id: bookings.slotId }).from(bookings).where(sql`${bookings.slotId} IS NOT NULL`)
          )
        )
      )
      .returning({ id: bookingSlots.id });

    const deletedCount = result.length;
    
    if (deletedCount > 0) {
      logInfo("cleanup.slots.cleaned", {
        count: deletedCount,
        timestamp: new Date().toISOString(),
      });
    }
    
    return deletedCount;
  } catch (error) {
    logError("cleanup.slots.failed", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}