import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { listBookingGroupsByPhone } from "@/lib/bookings/service";
import { myBookingsQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

/**
 * Public "my bookings" feed: booking groups for a phone number. Deliberately
 * coarse (phone-only) so the client can look orders up without an account.
 */
export const GET = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 20,
      windowMs: 15 * 60 * 1000,
      key: (request) => `booking:mine:${clientIp(request) ?? "unknown"}`,
    },
  },
  async (request) => {
    const phone = new URL(request.url).searchParams.get("phone") ?? "";
    const parsed = myBookingsQuerySchema.safeParse({ phone });
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", "A valid phone number is required.", 400);
    }
    const groups = await listBookingGroupsByPhone(parsed.data.phone);
    return jsonOk(groups);
  },
);