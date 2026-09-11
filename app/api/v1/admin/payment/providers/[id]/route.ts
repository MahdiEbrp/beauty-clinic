import { jsonOk } from "@/lib/api/security";
import { withSecurity } from "@/lib/api/security";
import { getPaymentProviderById, softDeletePaymentProvider, updatePaymentProvider } from "@/lib/payment/provider-service";
import { updatePaymentProviderSchema } from "@/lib/validation/payment-providers";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required", permissions: "payment.read" }, async (_req, ctx) => {
  const { id } = (ctx.params as { id: string }) ?? {};
  const provider = await getPaymentProviderById(id);
  if (!provider) return jsonOk({ error: { code: "NOT_FOUND", message: "Payment provider not found" } } as any, 404);
  return jsonOk(provider);
});

export const PATCH = withSecurity({ auth: "required", permissions: "payment.write", validate: { body: updatePaymentProviderSchema }, audit: true }, async (_req, ctx) => {
  const { id } = (ctx.params as { id: string }) ?? {};
  const body = ctx.body!;
  await updatePaymentProvider(id, body);
  return jsonOk({ success: true });
});

export const DELETE = withSecurity({ auth: "required", permissions: "payment.manage", audit: true }, async (_req, ctx) => {
  const { id } = (ctx.params as { id: string }) ?? {};
  await softDeletePaymentProvider(id);
  return jsonOk({ success: true });
});
