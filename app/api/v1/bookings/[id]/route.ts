import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteBooking,
  getBooking,
  updateBookingDetails,
} from "@/lib/bookings/service";
import { updateBookingAdminSchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid booking id.", 400);
}

function bookingNotFound() {
  return jsonError("BOOKING_NOT_FOUND", "Booking not found.", 404);
}

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    try {
      const booking = await getBooking(id);
      return jsonOk(booking);
    } catch {
      return bookingNotFound();
    }
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: updateBookingAdminSchema },
    audit: true,
    notification: {
      entityType: "booking",
      entityId: (ctx) => ctx.params?.id,
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    try {
      const booking = await updateBookingDetails(id, body);
      return jsonOk(booking);
    } catch {
      return bookingNotFound();
    }
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "appointments.manage",
    audit: true,
    notification: {
      entityType: "booking",
      entityId: (ctx) => ctx.params?.id,
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    try {
      await deleteBooking(id);
      return jsonOk({ ok: true });
    } catch {
      return bookingNotFound();
    }
  },
);
