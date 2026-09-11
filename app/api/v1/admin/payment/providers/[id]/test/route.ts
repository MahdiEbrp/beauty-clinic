import { jsonOk } from "@/lib/api/security";
import { withSecurity } from "@/lib/api/security";
import { testPaymentProvider } from "@/lib/payment/provider-check-service";

export const runtime = "nodejs";

export const POST = withSecurity({ auth: "required", permissions: "payment.manage" }, async (_req, ctx) => {
  const { id } = (ctx.params as { id: string }) ?? {};
  const session = ctx.session!;
  const result = await testPaymentProvider(id, session.user.id);
  return jsonOk(result);
});
