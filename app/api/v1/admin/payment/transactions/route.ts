import { jsonOk, withSecurity } from "@/lib/api/security";
import { createPaymentTransaction, listPaymentTransactions } from "@/lib/payment/transaction-service";
import { createPaymentTransactionSchema, listPaymentTransactionsQuerySchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required", permissions: "payment.read", validate: { query: listPaymentTransactionsQuerySchema } }, async (_req, ctx) => {
  const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
  return jsonOk(await listPaymentTransactions(query));
});

export const POST = withSecurity({ auth: "required", permissions: "payment.send", validate: { body: createPaymentTransactionSchema } }, async (_req, ctx) => {
  const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
  const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
  const result = await createPaymentTransaction(body, session.user.id, body.providerId);
  return jsonOk(result, 201);
});