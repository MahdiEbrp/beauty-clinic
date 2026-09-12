import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { createPaymentProviderAdapter } from "@/lib/payment/providers";
import { db } from "@/src/db";
import { paymentTransactions } from "@/src/db/schema";
import type { CreatePaymentTransactionInput, ListPaymentTransactionsQuery } from "@/lib/validation/payment-transactions";
import { PAYMENT_LIMITS } from "./constants";
import { getPaymentProviderForUse } from "./provider-service";

export type ListPaymentTransactionsResult = {
  items: (typeof paymentTransactions.$inferSelect)[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listPaymentTransactions(opts: ListPaymentTransactionsQuery): Promise<ListPaymentTransactionsResult> {
  const conds: SQL[] = [];
  if (opts.status && opts.status !== "all") conds.push(eq(paymentTransactions.status, opts.status));
  if (opts.search) {
    const s = or(ilike(paymentTransactions.bookingGroupRef, `%${opts.search}%`), ilike(paymentTransactions.authority, `%${opts.search}%`));
    if (s) conds.push(s);
  }
  const where = conds.length ? and(...conds) : undefined;
  const [c] = await db.select({ value: count() }).from(paymentTransactions).where(where);
  const total = c?.value ?? 0;
  const page = opts.page ?? PAYMENT_LIMITS.pageDefault;
  const perPage = opts.perPage ?? PAYMENT_LIMITS.transactionListPerPageDefault;
  const rows = await db.select().from(paymentTransactions).where(where).orderBy(desc(paymentTransactions.createdAt)).limit(perPage).offset((page - 1) * perPage);
  return { items: rows, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createPaymentTransaction(input: CreatePaymentTransactionInput, createdBy: string | null, providerId?: string): Promise<{ id: string; authority: string; paymentUrl: string }> {
  const provider = await getPaymentProviderForUse(providerId ?? input.providerId);
  const adapter = createPaymentProviderAdapter({ kind: provider.kind, merchantId: provider.merchantId, apiUrl: provider.apiUrl, callbackUrl: provider.callbackUrl, credentials: provider.credentials });
  const callbackUrl = provider.callbackUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/api/v1/payments/callback`;
  const amountRial = Math.round(input.amount * 10); // Toman -> Rial
  const result = await adapter.request({ amount: amountRial, description: input.description ?? `Payment ${input.bookingGroupRef}`, callbackUrl, orderId: input.bookingGroupRef, email: undefined, mobile: undefined });
  const [row] = await db.insert(paymentTransactions).values({ providerId: provider.id, bookingGroupRef: input.bookingGroupRef, amount: String(input.amount), description: input.description, authority: result.authority, status: "requested", callbackUrl, createdBy }).returning({ id: paymentTransactions.id, authority: paymentTransactions.authority });
  if (!row || !row.authority) throw new ApiError(500, "PAYMENT_CREATE_FAILED", "Could not create transaction");
  return { id: row.id, authority: row.authority, paymentUrl: result.paymentUrl };
}

export async function verifyPaymentTransaction(authority: string, amount?: number): Promise<{ verified: boolean; refId?: string; transactionId: string; locale: "fa" | "en"; bookingGroupRef: string; late: boolean }> {
  const [tx] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.authority, authority));
  if (!tx) throw new ApiError(404, "PAYMENT_TRANSACTION_NOT_FOUND", "Transaction not found");
  const locale = tx.locale === "en" ? "en" : "fa";
  const late = tx.status === "cancelled" || Boolean(tx.expiresAt && tx.expiresAt.getTime() <= Date.now());
  if (tx.status === "verified") return { verified: true, refId: tx.refId ?? undefined, transactionId: tx.id, locale, bookingGroupRef: tx.bookingGroupRef, late };
  const provider = tx.providerId ? await getPaymentProviderForUse(tx.providerId) : await getPaymentProviderForUse();
  const adapter = createPaymentProviderAdapter({ kind: provider.kind, merchantId: provider.merchantId, apiUrl: provider.apiUrl, callbackUrl: provider.callbackUrl, credentials: provider.credentials });
  const amountRial = amount !== undefined ? Math.round(amount * 10) : Math.round(Number(tx.amount) * 10);
  const v = await adapter.verify({ authority, amount: amountRial });
  const newStatus = v.verified ? "verified" : "failed";
  await db.update(paymentTransactions).set({ status: newStatus, refId: v.refId ?? null, cardPan: v.cardPan ?? null, errorMessage: v.verified ? null : v.providerStatus ?? null, verifiedAt: v.verified ? new Date() : null, updatedAt: new Date(), completedAt: new Date() }).where(eq(paymentTransactions.id, tx.id));
  // also update bookings to paid if verified
  if (v.verified && !late) {
    await db.execute(sql`UPDATE bookings SET status='paid', payment_reference=${v.refId ?? authority}, updated_at=NOW() WHERE group_ref=${tx.bookingGroupRef} AND status IN ('pending','waiting')`);
  }
  return { verified: v.verified, refId: v.refId, transactionId: tx.id, locale, bookingGroupRef: tx.bookingGroupRef, late };
}

export async function getPaymentTransactionById(id: string) {
  const [row] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
  return row ?? null;
}
