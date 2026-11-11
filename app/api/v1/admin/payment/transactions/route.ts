import { jsonOk, withSecurity } from "@/lib/api/security";
import { listPaymentTransactions } from "@/lib/payment/transaction-service";
import { listPaymentTransactionsQuerySchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required", permissions: "payment.read", validate: { query: listPaymentTransactionsQuerySchema } }, async (_req, ctx) => {
  const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
  return jsonOk(await listPaymentTransactions(query));
});

