import { z } from "zod";

import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { availableSlots, availableSlotsForGroups } from "@/lib/bookings/slots";
import { availableSlotsQuerySchema, sharedAvailableSlotsQuerySchema } from "@/lib/validation/bookings";
import { availableConsecutiveSlots } from "@/lib/bookings/slot-queries";
import { consecutiveSlotsQuerySchema } from "@/lib/validation/booking-sequence";
export const runtime = "nodejs";

/**
 * Public availability feed for a single date. Only slots that can still
 * accept a booking (active, `capacity - bookedCount > 0`) are returned.
 * Slot generation is manual only (date range on /dashboard/slots) — this
 * endpoint never auto-generates slots.
 */
export const GET = withSecurity(
  {
    auth: "public",
    rateLimit: {
      // The booking calendar prefetches one request per date in the visible month.
      limit: 120,
      windowMs: 60 * 1000,
      key: (request) => `slots:availability:${clientIp(request) ?? "unknown"}`,
    },
    validate: { query: z.union([consecutiveSlotsQuerySchema, availableSlotsQuerySchema, sharedAvailableSlotsQuerySchema]) },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const slots = "items" in query
      ? await availableConsecutiveSlots(query.date, query.items)
      : "groupIds" in query
      ? await availableSlotsForGroups(query.date, query.groupIds, query.quantity)
      : await availableSlots(query.date, query.groupId);
    return jsonOk(slots);
  },
);
