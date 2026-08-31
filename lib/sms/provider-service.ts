import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import {
  decryptProviderSecret,
  encryptProviderSecret,
  type DecryptedSmsProvider,
  type SmsProviderCredentials,
} from "@/lib/sms/crypto";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES } from "@/lib/sms/constants";
import type {
  CreateSmsProviderInput,
  ListSmsProvidersQuery,
  UpdateSmsProviderInput,
} from "@/lib/validation/sms";
import { db } from "@/src/db";
import { smsProviders, type SmsProviderKind } from "@/src/db/schema";

export type AdminSmsProvider = {
  id: string;
  name: string;
  kind: SmsProviderKind;
  apiUrl: string;
  sender: string | null;
  tokenConfigured: boolean;
  tokenLast4: string;
  credentials: {
    authScheme?: SmsProviderCredentials["authScheme"];
    lineNumber?: string;
    payloadMode?: SmsProviderCredentials["payloadMode"];
    hasApiKey: boolean;
    hasUsername: boolean;
    hasPassword: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListSmsProvidersResult = {
  items: AdminSmsProvider[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listSmsProviders(
  options: ListSmsProvidersQuery,
): Promise<ListSmsProvidersResult> {
  const conditions = providerConditions(options);
  const where = and(...conditions);
  const [countRow] = await db
    .select({ value: count() })
    .from(smsProviders)
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select()
    .from(smsProviders)
    .where(where)
    .orderBy(desc(smsProviders.isDefault), desc(smsProviders.updatedAt))
    .limit(options.perPage)
    .offset((options.page - 1) * options.perPage);

  return {
    items: rows.map(toAdminProvider),
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages: Math.ceil(total / options.perPage),
  };
}

export async function getSmsProviderById(id: string): Promise<AdminSmsProvider | null> {
  const [row] = await db
    .select()
    .from(smsProviders)
    .where(and(eq(smsProviders.id, id), isNull(smsProviders.deletedAt)));
  return row ? toAdminProvider(row) : null;
}

export async function createSmsProvider(
  input: CreateSmsProviderInput,
  createdBy: string,
): Promise<{ id: string }> {
  const secrets = encryptProviderSecret({
    apiUrl: input.apiUrl,
    token: input.token,
    credentials: input.credentials,
  });
  return db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx
        .update(smsProviders)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(eq(smsProviders.isDefault, true), isNull(smsProviders.deletedAt)));
    }
    const [row] = await tx
      .insert(smsProviders)
      .values({
        name: input.name,
        kind: input.kind,
        ...secrets,
        sender: input.sender ?? null,
        isActive: input.isActive,
        isDefault: input.isDefault,
        createdBy,
      })
      .returning({ id: smsProviders.id });
    if (!row) throw new ApiError(500, SMS_ERROR_CODES.providerCreateFailed, SMS_ERROR_MESSAGES.providerCreateFailed);
    return row;
  });
}

export async function updateSmsProvider(
  id: string,
  input: UpdateSmsProviderInput,
): Promise<void> {
  const row = await getSmsProviderRow(id);
  if (!row) throw new ApiError(404, SMS_ERROR_CODES.providerNotFound, SMS_ERROR_MESSAGES.providerNotFound);

  const existing = decryptProviderSecret(row);
  const hasSecretPatch =
    input.apiUrl !== undefined ||
    input.token !== undefined ||
    input.credentials !== undefined;
  const secrets = hasSecretPatch
    ? encryptProviderSecret({
        apiUrl: input.apiUrl ?? existing.apiUrl,
        token: input.token ?? existing.token,
        credentials: input.credentials ?? existing.credentials,
      })
    : undefined;

  await db.transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx
        .update(smsProviders)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(smsProviders.isDefault, true),
            isNull(smsProviders.deletedAt),
            sql`${smsProviders.id} <> ${id}`,
          ),
        );
    }
    const patch: Partial<typeof smsProviders.$inferInsert> = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.kind !== undefined ? { kind: input.kind } : {}),
      ...(input.sender !== undefined ? { sender: input.sender ?? null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(secrets ?? {}),
      updatedAt: new Date(),
    };
    await tx
      .update(smsProviders)
      .set(patch)
      .where(and(eq(smsProviders.id, id), isNull(smsProviders.deletedAt)));
  });
}

export async function softDeleteSmsProvider(id: string): Promise<void> {
  const [row] = await db
    .update(smsProviders)
    .set({
      isActive: false,
      isDefault: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(smsProviders.id, id), isNull(smsProviders.deletedAt)))
    .returning({ id: smsProviders.id });
  if (!row) throw new ApiError(404, SMS_ERROR_CODES.providerNotFound, SMS_ERROR_MESSAGES.providerNotFound);
}

export async function getSmsProviderForUse(id?: string): Promise<DecryptedSmsProvider> {
  const row = id
    ? await getSmsProviderRow(id)
    : await db.query.smsProviders.findFirst({
        where: and(
          eq(smsProviders.isActive, true),
          isNull(smsProviders.deletedAt),
        ),
        orderBy: [desc(smsProviders.isDefault), desc(smsProviders.updatedAt)],
      });
  if (!row) throw new ApiError(400, SMS_ERROR_CODES.providerNotConfigured, SMS_ERROR_MESSAGES.providerNotConfigured);
  if (!row.isActive || row.deletedAt) {
    throw new ApiError(400, SMS_ERROR_CODES.providerInactive, SMS_ERROR_MESSAGES.providerInactive);
  }
  return decryptProviderSecret(row);
}

export async function getSmsProviderRow(id: string) {
  const [row] = await db
    .select()
    .from(smsProviders)
    .where(and(eq(smsProviders.id, id), isNull(smsProviders.deletedAt)));
  return row ?? null;
}

function providerConditions(options: ListSmsProvidersQuery): SQL[] {
  const conditions: SQL[] = [isNull(smsProviders.deletedAt)];
  if (options.status === "active") conditions.push(eq(smsProviders.isActive, true));
  if (options.status === "inactive") conditions.push(eq(smsProviders.isActive, false));
  if (options.search) {
    const searchCondition = or(
      ilike(smsProviders.name, `%${options.search}%`),
      ilike(smsProviders.kind, `%${options.search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  return conditions;
}

function toAdminProvider(row: typeof smsProviders.$inferSelect): AdminSmsProvider {
  const decrypted = decryptProviderSecret(row);
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    apiUrl: decrypted.apiUrl,
    sender: row.sender,
    tokenConfigured: row.tokenEncrypted.length > 0,
    tokenLast4: row.tokenLast4,
    credentials: {
      authScheme: decrypted.credentials.authScheme,
      lineNumber: decrypted.credentials.lineNumber,
      payloadMode: decrypted.credentials.payloadMode,
      hasApiKey: Boolean(decrypted.credentials.apiKey),
      hasUsername: Boolean(decrypted.credentials.username),
      hasPassword: Boolean(decrypted.credentials.password),
    },
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
