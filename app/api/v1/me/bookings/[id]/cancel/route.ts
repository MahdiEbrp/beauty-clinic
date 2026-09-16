import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { cancelMyBooking, loadBookingOwner } from "@/lib/bookings/mine";

export const runtime = "nodejs";

function bookingId(ctx: { params?: Record<string, string> }): string | null {
  const id = ctx.params?.id;
  return id && z.uuid().safeParse(id).success ? id : null;
}

/**
 * Cancels a single service line of the signed-in owner's order, after
 * enforcing `booking.min_cancel_hours` against that line's slot.
 */
export const POST = withSecurity(
  {
    auth: "required",
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const id = bookingId(ctx);
    if (!id) return jsonError("INVALID_BOOKING_ID", "Invalid booking id.", 400);
    const owner = await loadBookingOwner(session.user.id);
    return jsonOk(await cancelMyBooking(owner, id));
  },
);
