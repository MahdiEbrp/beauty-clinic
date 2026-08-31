import { and, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES } from "@/lib/sms/constants";
import type {
  CreateSmsTemplateInput,
  ListSmsTemplatesQuery,
  UpdateSmsTemplateInput,
} from "@/lib/validation/sms";
import { db } from "@/src/db";
import { smsTemplates, smsTemplatesI18n, type SmsMessageType } from "@/src/db/schema";

export type AdminSmsTemplate = {
  id: string;
  key: string;
  messageType: SmsMessageType;
  variables: string[];
  translations: { fa?: { name: string; content: string }; en?: { name: string; content: string } };
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ListSmsTemplatesResult = {
  items: AdminSmsTemplate[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listSmsTemplates(
  options: ListSmsTemplatesQuery,
): Promise<ListSmsTemplatesResult> {
  const where = and(...templateConditions(options));
  const [countRow] = await db
    .select({ value: count() })
    .from(smsTemplates)
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select()
    .from(smsTemplates)
    .where(where)
    .orderBy(desc(smsTemplates.isActive), smsTemplates.displayOrder, desc(smsTemplates.updatedAt))
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

export async function getSmsTemplateById(id: string): Promise<AdminSmsTemplate | null> {
  const [row] = await db
    .select()
    .from(smsTemplates)
    .where(and(eq(smsTemplates.id, id), isNull(smsTemplates.deletedAt)));
  if (!row) return null;
  const translations = await loadTranslations([id]);
  return toAdminTemplate(row, translations.get(id));
}

export async function getSmsTemplateForUse(id: string) {
  const [row] = await db
    .select()
    .from(smsTemplates)
    .where(
      and(
        eq(smsTemplates.id, id),
        eq(smsTemplates.isActive, true),
        isNull(smsTemplates.deletedAt),
      ),
    );
  if (!row) throw new ApiError(404, SMS_ERROR_CODES.templateNotFound, SMS_ERROR_MESSAGES.templateNotFound);
  const translations = await loadTranslations([id]);
  return { ...row, translations: translations.get(id) ?? {} };
}

export async function createSmsTemplate(
  input: CreateSmsTemplateInput,
  createdBy: string,
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(smsTemplates)
      .values({
        key: input.key,
        messageType: input.messageType,
        variables: input.variables,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
        createdBy,
      })
      .returning({ id: smsTemplates.id });
    if (!row) throw new ApiError(500, SMS_ERROR_CODES.templateCreateFailed, SMS_ERROR_MESSAGES.templateCreateFailed);
    await tx.insert(smsTemplatesI18n).values([
      { templateId: row.id, locale: "fa", ...input.translations.fa },
      { templateId: row.id, locale: "en", ...input.translations.en },
    ]);
    return row;
  });
}

export async function updateSmsTemplate(
  id: string,
  input: UpdateSmsTemplateInput,
): Promise<void> {
  const existing = await getSmsTemplateById(id);
  if (!existing) throw new ApiError(404, SMS_ERROR_CODES.templateNotFound, SMS_ERROR_MESSAGES.templateNotFound);
  await db.transaction(async (tx) => {
    const patch: Partial<typeof smsTemplates.$inferInsert> = {
      ...(input.messageType !== undefined ? { messageType: input.messageType } : {}),
      ...(input.variables !== undefined ? { variables: input.variables } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedAt: new Date(),
    };
    await tx
      .update(smsTemplates)
      .set(patch)
      .where(and(eq(smsTemplates.id, id), isNull(smsTemplates.deletedAt)));
    if (input.translations) {
      await tx.delete(smsTemplatesI18n).where(eq(smsTemplatesI18n.templateId, id));
      await tx.insert(smsTemplatesI18n).values([
        { templateId: id, locale: "fa", ...input.translations.fa },
        { templateId: id, locale: "en", ...input.translations.en },
      ]);
    }
  });
}

export async function softDeleteSmsTemplate(id: string): Promise<void> {
  const [row] = await db
    .update(smsTemplates)
    .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(smsTemplates.id, id), isNull(smsTemplates.deletedAt)))
    .returning({ id: smsTemplates.id });
  if (!row) throw new ApiError(404, SMS_ERROR_CODES.templateNotFound, SMS_ERROR_MESSAGES.templateNotFound);
}

export function renderSmsTemplate(
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
      return value;
    },
  );
  if (missing.size > 0) {
    throw new ApiError(
      400,
      "SMS_TEMPLATE_VARIABLES_MISSING",
      `Missing template variables: ${[...missing].join(", ")}.`,
    );
  }
  return rendered;
}

async function loadTranslations(ids: string[]) {
  const map = new Map<string, { fa?: { name: string; content: string }; en?: { name: string; content: string } }>();
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(smsTemplatesI18n)
    .where(inArray(smsTemplatesI18n.templateId, ids));
  for (const row of rows) {
    const current = map.get(row.templateId) ?? {};
    current[row.locale] = { name: row.name, content: row.content };
    map.set(row.templateId, current);
  }
  return map;
}

function templateConditions(options: ListSmsTemplatesQuery): SQL[] {
  const conditions: SQL[] = [isNull(smsTemplates.deletedAt)];
  if (options.status === "active") conditions.push(eq(smsTemplates.isActive, true));
  if (options.status === "inactive") conditions.push(eq(smsTemplates.isActive, false));
  if (options.search) {
    const term = `%${options.search}%`;
    const searchCondition = or(
      ilike(smsTemplates.key, term),
      sql`exists (
        select 1 from ${smsTemplatesI18n}
        where ${smsTemplatesI18n.templateId} = ${smsTemplates.id}
          and (${smsTemplatesI18n.name} ilike ${term} OR ${smsTemplatesI18n.content} ilike ${term})
      )`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  return conditions;
}

function toAdminTemplate(
  row: typeof smsTemplates.$inferSelect,
  translations:
    | { fa?: { name: string; content: string }; en?: { name: string; content: string } }
    | undefined,
): AdminSmsTemplate {
  return {
    id: row.id,
    key: row.key,
    messageType: row.messageType,
    variables: row.variables,
    translations: translations ?? {},
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
