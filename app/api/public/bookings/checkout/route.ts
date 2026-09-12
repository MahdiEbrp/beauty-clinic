import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { createBookingCheckout } from "@/lib/payment/booking-checkout";
import { publicBookingCheckoutSchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      key: (request) => `booking:checkout:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: publicBookingCheckoutSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await createBookingCheckout(body));
  },
);
