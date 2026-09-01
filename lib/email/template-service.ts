import { and, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES } from "@/lib/email/constants";
import type {
  CreateEmailTemplateInput,
  ListEmailTemplatesQuery,
  UpdateEmailTemplateInput,
} from "@/lib/validation/email";
import { db } from "@/src/db";
import {
  emailTemplates,
  emailTemplatesI18n,
  type EmailContentFormat,
  type EmailMessageType,
} from "@/src/db/schema";

export type AdminEmailTemplate = {
  id: string;
  key: string;
  externalTemplateId?: string;
  messageType: EmailMessageType;
  contentFormat: EmailContentFormat;
  variables: string[];
  translations: {
    fa?: { name: string; subject: string; content: string };
    en?: { name: string; subject: string; content: string };
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ListEmailTemplatesResult = {
  items: AdminEmailTemplate[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listEmailTemplates(
  options: ListEmailTemplatesQuery,
): Promise<ListEmailTemplatesResult> {
  const where = and(...templateConditions(options));
  const [countRow] = await db
    .select({ value: count() })
    .from(emailTemplates)
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select()
    .from(emailTemplates)
    .where(where)
    .orderBy(desc(emailTemplates.isActive), emailTemplates.displayOrder, desc(emailTemplates.updatedAt))
    .limit(options.perPage)
    .offset((options.page - 1) * options.perPage);
  const translations = await loadTranslations(rows.map((row) => row.id));
  return {
    items: rows.map((row) => toAdminTemplate(row, translations.get(row.id))),
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages: Math.ceil(total / options.perPage),
  };
}

export async function getEmailTemplateById(id: string): Promise<AdminEmailTemplate | null> {
  const [row] = await db
    .select()
    .from(emailTemplates)
    .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)));
  if (!row) return null;
  const translations = await loadTranslations([id]);
  return toAdminTemplate(row, translations.get(id));
}

export async function getEmailTemplateForUse(id: string) {
  const [row] = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.id, id),
        eq(emailTemplates.isActive, true),
        isNull(emailTemplates.deletedAt),
      ),
    );
  if (!row) {
    throw new ApiError(
      404,
      EMAIL_ERROR_CODES.templateNotFound,
      EMAIL_ERROR_MESSAGES.templateNotFound,
    );
  }
  const translations = await loadTranslations([id]);
  return { ...row, translations: translations.get(id) ?? {} };
}

export async function createEmailTemplate(
  input: CreateEmailTemplateInput,
  createdBy: string,
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(emailTemplates)
      .values({
        key: input.key,
        externalTemplateId: input.externalTemplateId ?? null,
        messageType: input.messageType,
        contentFormat: input.contentFormat,
        variables: input.variables,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
        createdBy,
      })
      .returning({ id: emailTemplates.id });
    if (!row) {
      throw new ApiError(
        500,
        EMAIL_ERROR_CODES.templateCreateFailed,
        EMAIL_ERROR_MESSAGES.templateCreateFailed,
      );
    }
    await tx.insert(emailTemplatesI18n).values([
      { templateId: row.id, locale: "fa", ...input.translations.fa },
      { templateId: row.id, locale: "en", ...input.translations.en },
    ]);
    return row;
  });
}

export async function updateEmailTemplate(
  id: string,
  input: UpdateEmailTemplateInput,
): Promise<void> {
  const existing = await getEmailTemplateById(id);
  if (!existing) {
    throw new ApiError(
      404,
      EMAIL_ERROR_CODES.templateNotFound,
      EMAIL_ERROR_MESSAGES.templateNotFound,
    );
  }
  await db.transaction(async (tx) => {
    const patch: Partial<typeof emailTemplates.$inferInsert> = {
      ...(input.messageType !== undefined ? { messageType: input.messageType } : {}),
      ...(input.contentFormat !== undefined ? { contentFormat: input.contentFormat } : {}),
      ...(input.externalTemplateId !== undefined
        ? { externalTemplateId: input.externalTemplateId ?? null }
        : {}),
      ...(input.variables !== undefined ? { variables: input.variables } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedAt: new Date(),
    };
    await tx
      .update(emailTemplates)
      .set(patch)
      .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)));
    if (input.translations) {
      await tx.delete(emailTemplatesI18n).where(eq(emailTemplatesI18n.templateId, id));
      await tx.insert(emailTemplatesI18n).values([
        { templateId: id, locale: "fa", ...input.translations.fa },
        { templateId: id, locale: "en", ...input.translations.en },
      ]);
    }
  });
}

export async function softDeleteEmailTemplate(id: string): Promise<void> {
  const [row] = await db
    .update(emailTemplates)
    .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)))
    .returning({ id: emailTemplates.id });
  if (!row) {
    throw new ApiError(
      404,
      EMAIL_ERROR_CODES.templateNotFound,
      EMAIL_ERROR_MESSAGES.templateNotFound,
    );
  }
}

export function renderEmailTemplate(
  content: string,
  variables: Record<string, string> | undefined,
): string {
  const missing = new Set<string>();
  const rendered = content.replace(
    /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g,
    (_match, key: string) => {
      const value = variables?.[key];
      if (value === undefined) {
        missing.add(key);
        return "";
      }
      return escapeRendered(value);
    },
  );
  if (missing.size > 0) {
    throw new ApiError(
      400,
      "EMAIL_TEMPLATE_VARIABLES_MISSING",
      `Missing template variables: ${[...missing].join(", ")}.`,
    );
  }
  return rendered;
}

function escapeRendered(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadTranslations(ids: string[]) {
  const map = new Map<
    string,
    { fa?: { name: string; subject: string; content: string }; en?: { name: string; subject: string; content: string } }
  >();
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(emailTemplatesI18n)
    .where(inArray(emailTemplatesI18n.templateId, ids));
  for (const row of rows) {
    const current = map.get(row.templateId) ?? {};
    current[row.locale] = { name: row.name, subject: row.subject, content: row.content };
    map.set(row.templateId, current);
  }
  return map;
}

function templateConditions(options: ListEmailTemplatesQuery): SQL[] {
  const conditions: SQL[] = [isNull(emailTemplates.deletedAt)];
  if (options.status === "active") conditions.push(eq(emailTemplates.isActive, true));
  if (options.status === "inactive") conditions.push(eq(emailTemplates.isActive, false));
  if (options.search) {
    const term = `%${options.search}%`;
    const searchCondition = or(
      ilike(emailTemplates.key, term),
      sql`exists (
        select 1 from ${emailTemplatesI18n}
        where ${emailTemplatesI18n.templateId} = ${emailTemplates.id}
          and (${emailTemplatesI18n.name} ilike ${term} OR ${emailTemplatesI18n.content} ilike ${term} OR ${emailTemplatesI18n.subject} ilike ${term})
      )`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  return conditions;
}

function toAdminTemplate(
  row: typeof emailTemplates.$inferSelect,
  translations:
    | { fa?: { name: string; subject: string; content: string }; en?: { name: string; subject: string; content: string } }
    | undefined,
): AdminEmailTemplate {
  return {
    id: row.id,
    key: row.key,
    externalTemplateId: row.externalTemplateId ?? undefined,
    messageType: row.messageType,
    contentFormat: row.contentFormat,
    variables: row.variables,
    translations: translations ?? {},
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}