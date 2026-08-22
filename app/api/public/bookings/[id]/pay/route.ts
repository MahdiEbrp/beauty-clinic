import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { recordMockPayment } from "@/lib/bookings/service";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_ID", "Invalid booking id.", 400);
}

/**
 * Idempotent mock payment step. Marks the booking paid and returns its
 * reference; swapping in a real gateway stays behind this adapter.
 */
export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:pay:${clientIp(request) ?? "unknown"}`,
    },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const booking = await recordMockPayment(id);
    return jsonOk(booking);
  },
);
