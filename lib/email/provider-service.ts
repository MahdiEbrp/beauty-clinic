import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import {
  decryptProviderSecret,
  encryptProviderSecret,
  type DecryptedEmailProvider,
} from "@/lib/email/crypto";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES } from "@/lib/email/constants";
import type {
  CreateEmailProviderInput,
  ListEmailProvidersQuery,
  UpdateEmailProviderInput,
} from "@/lib/validation/email";
import { db } from "@/src/db";
import { emailProviders, type EmailEncryption, type EmailProviderKind } from "@/src/db/schema";

export type AdminEmailProvider = {
  id: string;
  name: string;
  kind: EmailProviderKind;
  host: string;
  port: number;
  username: string;
  encryption: EmailEncryption;
  fromEmail: string | null;
  fromName: string | null;
  passwordConfigured: boolean;
  passwordLast4: string;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListEmailProvidersResult = {
  items: AdminEmailProvider[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listEmailProviders(
  options: ListEmailProvidersQuery,
): Promise<ListEmailProvidersResult> {
  const conditions = providerConditions(options);
  const where = and(...conditions);
  const [countRow] = await db
    .select({ value: count() })
    .from(emailProviders)
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select()
    .from(emailProviders)
    .where(where)
    .orderBy(desc(emailProviders.isDefault), desc(emailProviders.updatedAt))
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

export async function getEmailProviderById(id: string): Promise<AdminEmailProvider | null> {
  const [row] = await db
    .select()
    .from(emailProviders)
    .where(and(eq(emailProviders.id, id), isNull(emailProviders.deletedAt)));
  return row ? toAdminProvider(row) : null;
}

export async function createEmailProvider(
  input: CreateEmailProviderInput,
  createdBy: string,
): Promise<{ id: string }> {
  const secrets = encryptProviderSecret({
    host: input.host,
    port: input.port,
    username: input.username,
    password: input.password,
  });
  return db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx
        .update(emailProviders)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(eq(emailProviders.isDefault, true), isNull(emailProviders.deletedAt)));
    }
    const [row] = await tx
      .insert(emailProviders)
      .values({
        name: input.name,
        kind: input.kind,
        ...secrets,
        encryption: input.encryption,
        fromEmail: input.fromEmail ?? null,
        fromName: input.fromName ?? null,
        isActive: input.isActive,
        isDefault: input.isDefault,
        createdBy,
      })
      .returning({ id: emailProviders.id });
    if (!row) {
      throw new ApiError(
        500,
        EMAIL_ERROR_CODES.providerCreateFailed,
        EMAIL_ERROR_MESSAGES.providerCreateFailed,
      );
    }
    return row;
  });
}

export async function updateEmailProvider(
  id: string,
  input: UpdateEmailProviderInput,
): Promise<void> {
  const row = await getEmailProviderRow(id);
  if (!row) {
    throw new ApiError(
      404,
      EMAIL_ERROR_CODES.providerNotFound,
      EMAIL_ERROR_MESSAGES.providerNotFound,
    );
  }

  const existing = decryptProviderSecret(row);
  const hasSecretPatch =
    input.host !== undefined ||
    input.port !== undefined ||
    input.username !== undefined ||
    input.password !== undefined;
  const secrets = hasSecretPatch
    ? encryptProviderSecret({
        host: input.host ?? existing.host,
        port: input.port ?? existing.port,
        username: input.username ?? existing.username,
        password: input.password ?? existing.password,
      })
    : undefined;

  await db.transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx
        .update(emailProviders)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(emailProviders.isDefault, true),
            isNull(emailProviders.deletedAt),
            sql`${emailProviders.id} <> ${id}`,
          ),
        );
    }
    const patch: Partial<typeof emailProviders.$inferInsert> = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.kind !== undefined ? { kind: input.kind } : {}),
      ...(input.encryption !== undefined ? { encryption: input.encryption } : {}),
      ...(input.fromEmail !== undefined ? { fromEmail: input.fromEmail ?? null } : {}),
      ...(input.fromName !== undefined ? { fromName: input.fromName ?? null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(secrets ?? {}),
      updatedAt: new Date(),
    };
    await tx
      .update(emailProviders)
      .set(patch)
      .where(and(eq(emailProviders.id, id), isNull(emailProviders.deletedAt)));
  });
}

export async function softDeleteEmailProvider(id: string): Promise<void> {
  const [row] = await db
    .update(emailProviders)
    .set({
      isActive: false,
      isDefault: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(emailProviders.id, id), isNull(emailProviders.deletedAt)))
    .returning({ id: emailProviders.id });
  if (!row) {
    throw new ApiError(
      404,
      EMAIL_ERROR_CODES.providerNotFound,
      EMAIL_ERROR_MESSAGES.providerNotFound,
    );
  }
}

export async function getEmailProviderForUse(
  id?: string,
): Promise<DecryptedEmailProvider> {
  const row = id
    ? await getEmailProviderRow(id)
    : await db.query.emailProviders.findFirst({
        where: and(
          eq(emailProviders.isActive, true),
          isNull(emailProviders.deletedAt),
        ),
        orderBy: [desc(emailProviders.isDefault), desc(emailProviders.updatedAt)],
      });
  if (!row) {
    throw new ApiError(
      400,
      EMAIL_ERROR_CODES.providerNotConfigured,
      EMAIL_ERROR_MESSAGES.providerNotConfigured,
    );
  }
  if (!row.isActive || row.deletedAt) {
    throw new ApiError(
      400,
      EMAIL_ERROR_CODES.providerInactive,
      EMAIL_ERROR_MESSAGES.providerInactive,
    );
  }
  return decryptProviderSecret(row);
}

export async function getEmailProviderRow(id: string) {
  const [row] = await db
    .select()
    .from(emailProviders)
    .where(and(eq(emailProviders.id, id), isNull(emailProviders.deletedAt)));
  return row ?? null;
}

function providerConditions(options: ListEmailProvidersQuery): SQL[] {
  const conditions: SQL[] = [isNull(emailProviders.deletedAt)];
  if (options.status === "active") conditions.push(eq(emailProviders.isActive, true));
  if (options.status === "inactive") conditions.push(eq(emailProviders.isActive, false));
  if (options.search) {
    const searchCondition = or(
      ilike(emailProviders.name, `%${options.search}%`),
      ilike(emailProviders.kind, `%${options.search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  return conditions;
}

function toAdminProvider(
  row: typeof emailProviders.$inferSelect,
): AdminEmailProvider {
  const decrypted = decryptProviderSecret(row);
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    host: decrypted.host,
    port: decrypted.port,
    username: decrypted.username,
    encryption: row.encryption,
    fromEmail: row.fromEmail,
    fromName: row.fromName,
    passwordConfigured: row.passwordEncrypted.length > 0,
    passwordLast4: row.passwordLast4,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}