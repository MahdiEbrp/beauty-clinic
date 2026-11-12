import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { availableSlotDates } from "@/lib/bookings/slots";
import { availableSlotDatesQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Public read-only feed for calendar dates with at least one available slot.
 * The data comes from the same booking_slots records shown in /dashboard/slots,
 * with active status, remaining capacity and selected service groups applied.
 * Slot generation is manual only (date range on /dashboard/slots) — this
 * endpoint never auto-generates slots.
 */
export const GET = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 30,
      windowMs: 60 * 1000,
      key: (request) => `booking:availability-days:${clientIp(request) ?? "unknown"}`,
    },
    validate: { query: availableSlotDatesQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();

    const dates = await availableSlotDates(
      query.from,
      query.to,
      query.groupId,
      query.groupIds
        ? { groupIds: query.groupIds, quantity: query.quantity }
        : undefined,
    );

    return jsonOk(dates);
  },
);
