import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { updatePaymentTransaction } from "@/lib/payment/transaction-service";
import { updatePaymentTransactionSchema } from "@/lib/validation/payment-transactions";

export const runtime = "nodejs";

function transactionId(ctx: { params?: Record<string, string> }): string | null {
  const id = ctx.params?.id;
  return id && z.uuid().safeParse(id).success ? id : null;
}

export const PATCH = withSecurity({ auth: "required", permissions: "payment.write", validate: { body: updatePaymentTransactionSchema } }, async (_req, ctx) => {
  const id = transactionId(ctx);
  if (!id) return jsonError("INVALID_TRANSACTION_ID", "Invalid transaction id.", 400);
  const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
  const row = await updatePaymentTransaction(id, body);
  return jsonOk(row);
});