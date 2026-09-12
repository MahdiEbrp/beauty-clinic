import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { getPaymentProviderById, softDeletePaymentProvider, updatePaymentProvider } from "@/lib/payment/provider-service";
import { updatePaymentProviderSchema } from "@/lib/validation/payment-providers";

export const runtime = "nodejs";

function providerId(ctx: { params?: Record<string, string> }): string | null {
  const id = ctx.params?.id;
  return id && z.uuid().safeParse(id).success ? id : null;
}

function invalidId() {
  return jsonError("INVALID_PROVIDER_ID", "Invalid payment provider id.", 400);
}

export const GET = withSecurity({ auth: "required", permissions: "payment.read" }, async (_req, ctx) => {
  const id = providerId(ctx);
  if (!id) return invalidId();
  const provider = await getPaymentProviderById(id);
  if (!provider) return jsonError("NOT_FOUND", "Payment provider not found.", 404);
  return jsonOk(provider);
});

export const PATCH = withSecurity({ auth: "required", permissions: "payment.write", validate: { body: updatePaymentProviderSchema }, audit: true }, async (_req, ctx) => {
  const id = providerId(ctx);
  if (!id) return invalidId();
  const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
  await updatePaymentProvider(id, body);
  return jsonOk({ success: true });
});

export const DELETE = withSecurity({ auth: "required", permissions: "payment.manage", audit: true }, async (_req, ctx) => {
  const id = providerId(ctx);
  if (!id) return invalidId();
  await softDeletePaymentProvider(id);
  return jsonOk({ success: true });
});