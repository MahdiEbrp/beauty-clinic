import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { toMoney } from "@/lib/bookings/money";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { bookings, paymentTransactions } from "@/src/db/schema";

import { PAYMENT_ERROR_MESSAGES, PAYMENT_LIMITS } from "./constants";
import { createPaymentProviderAdapter } from "./providers";
import { getPaymentProviderForUse } from "./provider-service";
import { createPaymentRetryToken, readPaymentRetryToken } from "./retry-token";
import type { PublicBookingCheckoutInput } from "@/lib/validation/payment-transactions";

type CheckoutResult = { paymentUrl: string; transactionId: string; expiresAt: string };
type PaymentResult = {
  id: string;
  bookingGroupRef: string;
  amount: string;
  currency: string;
  status: "requested" | "verified" | "failed" | "cancelled" | "pending" | "refunded";
  refId: string | null;
  authority: string | null;
  expiresAt: Date | null;
  locale: "fa" | "en";
};

export async function createBookingCheckout(input: PublicBookingCheckoutInput, expiresAt?: Date): Promise<CheckoutResult> {
  const existing = await findByIdempotencyKey(input.idempotencyKey);
  if (existing) return existingCheckout(existing);

  const group = await db.select({ status: bookings.status }).from(bookings).where(eq(bookings.groupRef, input.groupRef));
  if (group.length === 0) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
  if (group.some((booking) => booking.status === "paid" || booking.status === "waiting" || booking.status === "done")) {
    throw new ApiError(409, "BOOKING_ALREADY_PAID", "This booking has already been paid.");
  }
  if (group.some((booking) => booking.status !== "pending")) {
    throw new ApiError(409, "BOOKING_NOT_PAYABLE", "This booking is no longer payable.");
  }

  const liveGroupCheckout = await findLiveGroupCheckout(input.groupRef);
  if (liveGroupCheckout) return existingCheckout(liveGroupCheckout);

  const provider = await getPaymentProviderForUse();
  const settings = await loadSystemSettingsMap();
  const deposit = toMoney(settings.get("booking.price"));
  // The configured deposit belongs to the booking order, not each
  // selected service line. Charge it exactly once for the whole group.
  const amount = deposit;
  const holdExpiresAt = expiresAt ?? new Date(Date.now() + PAYMENT_LIMITS.checkoutExpiryMinutes * 60_000);
  if (holdExpiresAt.getTime() <= Date.now()) throw new ApiError(409, "PAYMENT_EXPIRED", "The payment window has expired.");
  const callbackUrl = provider.callbackUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/api/v1/payments/callback`;

  let transaction: { id: string };
  try {
    [transaction] = await db.insert(paymentTransactions).values({
      providerId: provider.id,
      bookingGroupRef: input.groupRef,
      amount: String(amount),
      description: `Booking deposit ${input.groupRef}`,
      idempotencyKey: input.idempotencyKey,
      locale: input.locale,
      status: "pending",
      callbackUrl,
      expiresAt: holdExpiresAt,
      createdBy: null,
    }).returning({ id: paymentTransactions.id });
  } catch {
    const raced = (await findByIdempotencyKey(input.idempotencyKey)) ?? (await findLiveGroupCheckout(input.groupRef));
    if (raced) return existingCheckout(raced);
    throw new ApiError(500, "PAYMENT_CREATE_FAILED", "Could not create the payment request.");
  }
  if (!transaction) throw new ApiError(500, "PAYMENT_CREATE_FAILED", "Could not create the payment request.");

  try {
    const adapter = createPaymentProviderAdapter(provider);
    const gateway = await adapter.request({
      amount: Math.round(amount * 10),
      description: `Booking deposit ${input.groupRef}`,
      callbackUrl,
      orderId: input.groupRef,
    });
    await db.update(paymentTransactions).set({
      authority: gateway.authority,
      paymentUrl: gateway.paymentUrl,
      status: "requested",
      updatedAt: new Date(),
    }).where(eq(paymentTransactions.id, transaction.id));
    return { paymentUrl: gateway.paymentUrl, transactionId: transaction.id, expiresAt: holdExpiresAt.toISOString() };
  } catch (error) {
    await db.update(paymentTransactions).set({
      status: "failed",
      errorCode: error instanceof Error && "code" in error ? String(error.code) : "PAYMENT_REQUEST_FAILED",
      errorMessage: error instanceof Error ? error.message : PAYMENT_ERROR_MESSAGES.transactionCreateFailed,
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(paymentTransactions.id, transaction.id));
    throw error;
  }
}

export async function createRetryCheckout(token: string): Promise<CheckoutResult> {
  const payload = readPaymentRetryToken(token);
  if (!payload) throw new ApiError(400, "INVALID_RETRY_TOKEN", "This payment retry link is invalid or expired.");
  const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, payload.id));
  if (!transaction || !transaction.expiresAt || transaction.expiresAt.getTime() !== payload.exp || transaction.status !== "failed") {
    throw new ApiError(409, "PAYMENT_NOT_RETRYABLE", "This payment can no longer be retried.");
  }
  return createBookingCheckout({
    groupRef: transaction.bookingGroupRef,
    idempotencyKey: `retry:${transaction.id}`,
    locale: transaction.locale === "en" ? "en" : "fa",
  }, transaction.expiresAt);
}

export async function markPaymentFailed(authority: string, message: string): Promise<PaymentResult | null> {
  const [transaction] = await db.update(paymentTransactions).set({
    status: "failed",
    errorCode: "PAYMENT_DECLINED",
    errorMessage: message,
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(and(eq(paymentTransactions.authority, authority), inArray(paymentTransactions.status, ["pending", "requested"]))).returning();
  return transaction ? toPaymentResult(transaction) : getPaymentResultByAuthority(authority);
}

export async function getPaymentResultByAuthority(authority: string): Promise<PaymentResult | null> {
  const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.authority, authority));
  return transaction ? toPaymentResult(transaction) : null;
}

export function retryTokenFor(result: PaymentResult): string | null {
  return result.status === "failed" && result.expiresAt && result.expiresAt.getTime() > Date.now()
    ? createPaymentRetryToken(result.id, result.expiresAt)
    : null;
}

export async function expireBookingCheckouts(): Promise<{ expired: number; released: number }> {
  const now = new Date();
  const due = await db.select({ id: paymentTransactions.id, bookingGroupRef: paymentTransactions.bookingGroupRef })
    .from(paymentTransactions)
    .where(and(inArray(paymentTransactions.status, ["pending", "requested", "failed"]), isNotNull(paymentTransactions.expiresAt), lt(paymentTransactions.expiresAt, now)));
  if (due.length === 0) return { expired: 0, released: 0 };
  const ids = due.map((item) => item.id);
  const groupRefs = [...new Set(due.map((item) => item.bookingGroupRef))];
  await db.update(paymentTransactions).set({ status: "cancelled", completedAt: now, updatedAt: now })
    .where(inArray(paymentTransactions.id, ids));
  const released = await db.delete(bookings).where(and(inArray(bookings.groupRef, groupRefs), eq(bookings.status, "pending"))).returning({ id: bookings.id });
  return { expired: ids.length, released: released.length };
}

function findByIdempotencyKey(key: string) {
  return db.query.paymentTransactions.findFirst({ where: eq(paymentTransactions.idempotencyKey, key) });
}

function findLiveGroupCheckout(groupRef: string) {
  return db.query.paymentTransactions.findFirst({
    where: (transaction, { and, eq, gt, inArray, isNotNull }) =>
      and(
        eq(transaction.bookingGroupRef, groupRef),
        inArray(transaction.status, ["pending", "requested"]),
        isNotNull(transaction.expiresAt),
        gt(transaction.expiresAt, new Date()),
      ),
  });
}

function existingCheckout(transaction: typeof paymentTransactions.$inferSelect): CheckoutResult {
  if (transaction.status === "verified") throw new ApiError(409, "BOOKING_ALREADY_PAID", "This booking has already been paid.");
  if (!transaction.paymentUrl || !transaction.expiresAt || transaction.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(409, "PAYMENT_NOT_RETRYABLE", "This payment request can no longer be used.");
  }
  return { paymentUrl: transaction.paymentUrl, transactionId: transaction.id, expiresAt: transaction.expiresAt.toISOString() };
}

function toPaymentResult(transaction: typeof paymentTransactions.$inferSelect): PaymentResult {
  return {
    id: transaction.id,
    bookingGroupRef: transaction.bookingGroupRef,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    refId: transaction.refId,
    authority: transaction.authority,
    expiresAt: transaction.expiresAt,
    locale: transaction.locale === "en" ? "en" : "fa",
  };
}
