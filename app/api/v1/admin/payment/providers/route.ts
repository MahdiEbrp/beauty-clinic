import { jsonOk, withSecurity } from "@/lib/api/security";
import { createPaymentProvider, listPaymentProviders } from "@/lib/payment/provider-service";
import { createPaymentProviderSchema, listPaymentProvidersQuerySchema } from "@/lib/validation/payment-providers";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "payment.read", validate: { query: listPaymentProvidersQuerySchema } },
  async (_req, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listPaymentProviders(query));
  },
);

export const POST = withSecurity(
  { auth: "required", permissions: "payment.write", validate: { body: createPaymentProviderSchema }, audit: true, notification: { entityType: "payment_provider", action: "created" } },
  async (_req, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createPaymentProvider(body, session.user.id);
    return jsonOk(result, 201);
  },
);