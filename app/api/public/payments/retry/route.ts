import { jsonOk, withSecurity } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { createRetryCheckout } from "@/lib/payment/booking-checkout";
import { retryPaymentSchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: 5,
      windowMs: 60 * 60 * 1000,
      key: (request) => `payment:retry:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: retryPaymentSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await createRetryCheckout(body.token));
  },
);
