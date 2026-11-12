import { z } from "zod";

import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { availableSlots, availableSlotsForGroups } from "@/lib/bookings/slots";
import { ensureAutoSlots } from "@/lib/bookings/generator";
import { availableSlotsQuerySchema, sharedAvailableSlotsQuerySchema } from "@/lib/validation/bookings";
export const runtime = "nodejs";

/**
 * Public availability feed for a single date. Only slots that can still
 * accept a booking (active, `capacity - bookedCount > 0`) are returned.
 */
export const GET = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 30,
      windowMs: 60 * 1000,
      key: (request) => `slots:availability:${clientIp(request) ?? "unknown"}`,
    },
    validate: { query: z.union([availableSlotsQuerySchema, sharedAvailableSlotsQuerySchema]) },
  },
  async (_request, ctx) => {
    // Materialize the configured window on demand instead of depending only on
    // a daily timer in a possibly short-lived serverless process.
    await ensureAutoSlots();

    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const slots = "groupIds" in query
      ? await availableSlotsForGroups(query.date, query.groupIds, query.quantity)
      : await availableSlots(query.date, query.groupId);
    return jsonOk(slots);
  },
);
