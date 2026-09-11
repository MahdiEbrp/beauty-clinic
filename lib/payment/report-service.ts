import { count, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { paymentProviders, paymentTransactions } from "@/src/db/schema";

export async function getPaymentOverview(): Promise<{
  activeProviderCount: number;
  totalTransactions: number;
  verifiedCount: number;
  pendingCount: number;
  totalVolume: number;
  activeProviderPercentage: number;
}> {
  const [activeProviders] = await db.select({ value: count() }).from(paymentProviders).where(eq(paymentProviders.isActive, true));
  const [totalProviders] = await db.select({ value: count() }).from(paymentProviders).where(isNull(paymentProviders.deletedAt));
  const [totalTx] = await db.select({ value: count() }).from(paymentTransactions);
  const [verifiedTx] = await db.select({ value: count() }).from(paymentTransactions).where(eq(paymentTransactions.status, "verified"));
  const [pendingTx] = await db.select({ value: count() }).from(paymentTransactions).where(eq(paymentTransactions.status, "pending"));
  const [volume] = await db.select({ value: sql<number>`COALESCE(SUM(CASE WHEN status='verified' THEN amount::numeric ELSE 0 END),0)` }).from(paymentTransactions);
  const active = activeProviders?.value ?? 0;
  const total = totalProviders?.value ?? 0;
  return {
    activeProviderCount: active,
    totalTransactions: totalTx?.value ?? 0,
    verifiedCount: verifiedTx?.value ?? 0,
    pendingCount: pendingTx?.value ?? 0,
    totalVolume: Number(volume?.value ?? 0),
    activeProviderPercentage: total > 0 ? Math.round((active / total) * 100) : 0,
  };
}

export type PaymentOverview = Awaited<ReturnType<typeof getPaymentOverview>>;

export async function getPaymentProvidersForSelect(): Promise<{ id: string; name: string }[]> {
  const rows = await db.select({ id: paymentProviders.id, name: paymentProviders.name }).from(paymentProviders).where(eq(paymentProviders.isActive, true)).orderBy(desc(paymentProviders.isDefault), desc(paymentProviders.updatedAt));
  return rows;
}

// Stubs for wizard compatibility — exact copy pattern expects these
export async function getPaymentComposeDatasets(): Promise<{ providerItems: { id: string; name: string }[] }> {
  return { providerItems: await getPaymentProvidersForSelect() };
}

export type AdminPaymentMessage = (typeof paymentTransactions.$inferSelect) & { amount: string };
export type ListPaymentMessagesResult = { items: AdminPaymentMessage[]; total: number; page: number; perPage: number; totalPages: number };
export async function listPaymentMessages(): Promise<ListPaymentMessagesResult> {
  const { listPaymentTransactions } = await import("./transaction-service");
  const res = await listPaymentTransactions({ page: 1, perPage: 20, status: "all" });
  return { items: res.items as unknown as AdminPaymentMessage[], total: res.total, page: res.page, perPage: res.perPage, totalPages: res.totalPages };
}

export type PaymentRecipient = { id: string; name: string; phone?: string };
export type ListPaymentRecipientsResult = { items: PaymentRecipient[]; total: number; page: number; perPage: number; totalPages: number };
