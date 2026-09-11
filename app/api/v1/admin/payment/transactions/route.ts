import { jsonOk } from "@/lib/api/security";
import { withSecurity } from "@/lib/api/security";
import { createPaymentTransaction, listPaymentTransactions } from "@/lib/payment/transaction-service";
import { createPaymentTransactionSchema, listPaymentTransactionsQuerySchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required", permissions: "payment.read", validate: { query: listPaymentTransactionsQuerySchema } }, async (_req, ctx) => {
  const query = ctx.query!;
  return jsonOk(await listPaymentTransactions(query));
});

export const POST = withSecurity({ auth: "required", permissions: "payment.send", validate: { body: createPaymentTransactionSchema } }, async (_req, ctx) => {
  const body = ctx.body!;
  const session = ctx.session!;
  const result = await createPaymentTransaction(body, session.user.id, (body as any).providerId);
  return jsonOk(result, 201);
});
