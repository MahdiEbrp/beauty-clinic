import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { testPaymentProvider } from "@/lib/payment/provider-check-service";

export const runtime = "nodejs";

export const POST = withSecurity({ auth: "required", permissions: "payment.manage" }, async (_req, ctx) => {
  const id = ctx.params?.id;
  if (!id || !z.uuid().safeParse(id).success) return jsonError("INVALID_PROVIDER_ID", "Invalid payment provider id.", 400);
  const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
  const result = await testPaymentProvider(id, session.user.id);
  return jsonOk(result);
});