import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/src/db";
import { bookingSlots, bookings } from "@/src/db/schema";

export type BookingsPerformance = {
  reservations: { total: number; active: number };
  slots: { total: number; active: number };
};

/**
 * Overview counts for the bookings management hub.
 * Two sequential aggregate queries (never parallel fan-outs) keep the pool calm.
 */
export async function getBookingsPerformance(): Promise<BookingsPerformance> {
  const [bookingRow] = await db
    .select({
      total: sql<number>`count(distinct ${bookings.groupRef})::int`,
      active: sql<number>`count(distinct ${bookings.groupRef}) filter (where ${bookings.status} in ('pending','paid','waiting'))::int`,
    })
    .from(bookings);

  const [slotRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      // Derived-active: toggled on and not yet past its end time.
      active: sql<number>`count(*) filter (where ${bookingSlots.isActive} and now() <= (${bookingSlots.slotDate} + ${bookingSlots.endTime}))::int`,
    })
    .from(bookingSlots);

  return {
    reservations: {
      total: Number(bookingRow?.total ?? 0),
      active: Number(bookingRow?.active ?? 0),
    },
    slots: {
      total: Number(slotRow?.total ?? 0),
      active: Number(slotRow?.active ?? 0),
    },
  };
}
