import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { decryptPaymentProviderSecret, encryptPaymentProviderSecret, type DecryptedPaymentProvider } from "@/lib/payment/crypto";
import { PAYMENT_ERROR_CODES, PAYMENT_ERROR_MESSAGES, PAYMENT_LIMITS } from "@/lib/payment/constants";
import type { CreatePaymentProviderInput, ListPaymentProvidersQuery, UpdatePaymentProviderInput } from "@/lib/validation/payment-providers";
import { db } from "@/src/db";
import { paymentProviders, type PaymentProviderKind } from "@/src/db/schema";

export type AdminPaymentProvider = {
  id: string;
  name: string;
  kind: PaymentProviderKind;
  apiUrl: string;
  merchantLast4: string;
  merchantConfigured: boolean;
  callbackUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListPaymentProvidersResult = {
  items: AdminPaymentProvider[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listPaymentProviders(options: ListPaymentProvidersQuery): Promise<ListPaymentProvidersResult> {
  const conditions = providerConditions(options);
  const where = and(...conditions);
  const page = options.page ?? PAYMENT_LIMITS.pageDefault;
  const perPage = options.perPage ?? PAYMENT_LIMITS.providerListPerPageDefault;
  const [countRow] = await db.select({ value: count() }).from(paymentProviders).where(where);
  const total = countRow?.value ?? 0;
  const rows = await db.select().from(paymentProviders).where(where).orderBy(desc(paymentProviders.isDefault), desc(paymentProviders.updatedAt)).limit(perPage).offset((page - 1) * perPage);
  return { items: rows.map(toAdmin), total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getPaymentProviderById(id: string): Promise<AdminPaymentProvider | null> {
  const [row] = await db.select().from(paymentProviders).where(and(eq(paymentProviders.id, id), isNull(paymentProviders.deletedAt)));
  return row ? toAdmin(row) : null;
}

export async function createPaymentProvider(input: CreatePaymentProviderInput, createdBy: string): Promise<{ id: string }> {
  const secrets = encryptPaymentProviderSecret({ merchantId: input.merchantId, apiUrl: input.apiUrl || "", credentials: { sandbox: input.sandbox } });
  return db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx.update(paymentProviders).set({ isDefault: false, updatedAt: new Date() }).where(and(eq(paymentProviders.isDefault, true), isNull(paymentProviders.deletedAt)));
    }
    const [row] = await tx.insert(paymentProviders).values({ name: input.name, kind: input.kind, ...secrets, callbackUrl: input.callbackUrl ?? null, isActive: input.isActive ?? true, isDefault: input.isDefault ?? false, createdBy }).returning({ id: paymentProviders.id });
    if (!row) throw new ApiError(500, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerCreateFailed);
    return row;
  });
}

export async function updatePaymentProvider(id: string, input: UpdatePaymentProviderInput): Promise<void> {
  const row = await getPaymentProviderRow(id);
  if (!row) throw new ApiError(404, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerNotFound);
  const existing = decryptPaymentProviderSecret(row);
  const hasSecretPatch = input.apiUrl !== undefined || input.merchantId !== undefined || input.sandbox !== undefined;
  const secrets = hasSecretPatch
    ? encryptPaymentProviderSecret({
        merchantId: input.merchantId ?? existing.merchantId,
        apiUrl: input.apiUrl ?? existing.apiUrl,
        credentials: { sandbox: input.sandbox ?? existing.credentials.sandbox },
      })
    : undefined;
  await db.transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.update(paymentProviders).set({ isDefault: false, updatedAt: new Date() }).where(and(eq(paymentProviders.isDefault, true), isNull(paymentProviders.deletedAt), sql`${paymentProviders.id} <> ${id}`));
    }
    const patch: Partial<typeof paymentProviders.$inferInsert> = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.kind !== undefined ? { kind: input.kind } : {}),
      ...(input.callbackUrl !== undefined ? { callbackUrl: input.callbackUrl ?? null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(secrets ?? {}),
      updatedAt: new Date(),
    };
    await tx.update(paymentProviders).set(patch).where(and(eq(paymentProviders.id, id), isNull(paymentProviders.deletedAt)));
  });
}

export async function softDeletePaymentProvider(id: string): Promise<void> {
  const [row] = await db.update(paymentProviders).set({ isActive: false, isDefault: false, deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(paymentProviders.id, id), isNull(paymentProviders.deletedAt))).returning({ id: paymentProviders.id });
  if (!row) throw new ApiError(404, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerNotFound);
}

export async function getPaymentProviderForUse(id?: string): Promise<DecryptedPaymentProvider> {
  const row = id
    ? await getPaymentProviderRow(id)
    : await db.query.paymentProviders.findFirst({
      where: and(
        eq(paymentProviders.isActive, true),
        eq(paymentProviders.isDefault, true),
        isNull(paymentProviders.deletedAt),
      ),
      orderBy: [desc(paymentProviders.updatedAt)],
    });
  if (!row) throw new ApiError(400, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerNotConfigured);
  if (!row.isActive || row.deletedAt) throw new ApiError(400, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerNotFound);
  return decryptPaymentProviderSecret(row);
}

export async function getPaymentProviderRow(id: string) {
  const [row] = await db.select().from(paymentProviders).where(and(eq(paymentProviders.id, id), isNull(paymentProviders.deletedAt)));
  return row ?? null;
}

function providerConditions(options: ListPaymentProvidersQuery): SQL[] {
  const c: SQL[] = [isNull(paymentProviders.deletedAt)];
  if (options.status === "active") c.push(eq(paymentProviders.isActive, true));
  if (options.status === "inactive") c.push(eq(paymentProviders.isActive, false));
  if (options.search) {
    const sc = or(ilike(paymentProviders.name, `%${options.search}%`), ilike(paymentProviders.kind, `%${options.search}%`));
    if (sc) c.push(sc);
  }
  return c;
}

function toAdmin(row: typeof paymentProviders.$inferSelect): AdminPaymentProvider {
  const d = decryptPaymentProviderSecret(row);
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    apiUrl: d.apiUrl,
    merchantLast4: row.merchantLast4,
    merchantConfigured: row.merchantIdEncrypted.length > 0,
    callbackUrl: row.callbackUrl,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
