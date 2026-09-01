import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { decryptSecret } from "@/lib/auth/encryption";
import { EMAIL_LIMITS } from "@/lib/email/constants";
import { hashRecipient } from "@/lib/email/email";
import type {
  ListEmailMessagesQuery,
  ListEmailProvidersQuery,
  ListEmailRecipientsQuery,
  ListEmailTemplatesQuery,
} from "@/lib/validation/email";
import { db } from "@/src/db";
import {
  emailMessages,
  emailProviders,
  emailTemplates,
  users,
  type EmailHealthStatus,
  type EmailMessageStatus,
  type EmailProviderKind,
} from "@/src/db/schema";
import type { AdminEmailProvider, ListEmailProvidersResult } from "./provider-service";
import type { AdminEmailTemplate, ListEmailTemplatesResult } from "./template-service";
import { listEmailProviders } from "./provider-service";
import { listEmailTemplates } from "./template-service";

export type AdminEmailMessage = {
  id: string;
  recipientMasked: string;
  providerName: string | null;
  providerKind: EmailProviderKind | null;
  status: EmailMessageStatus;
  providerMessageId: string | null;
  providerStatus: string | null;
  errorMessage: string | null;
  createdAt: Date;
  sentAt: Date | null;
  deliveredAt: Date | null;
};

export type ListEmailMessagesResult = {
  items: AdminEmailMessage[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type EmailOverview = {
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  };
  providerCount: number;
  activeProviderCount: number;
  templateCount: number;
  activeTemplateCount: number;
  providers: Array<{
    id: string;
    name: string;
    kind: EmailProviderKind;
    host: string;
    passwordLast4: string;
    healthStatus: EmailHealthStatus;
    isActive: boolean;
    isDefault: boolean;
    lastHealthCheckedAt: Date | null;
  }>;
  recentMessages: AdminEmailMessage[];
};

export async function listEmailMessages(
  options: ListEmailMessagesQuery,
): Promise<ListEmailMessagesResult> {
  const where = and(...messageConditions(options));
  const [countRow] = await db
    .select({ value: count() })
    .from(emailMessages)
    .leftJoin(emailProviders, eq(emailProviders.id, emailMessages.providerId))
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select({
      id: emailMessages.id,
      recipientMasked: emailMessages.recipientMasked,
      providerName: emailProviders.name,
      providerKind: emailProviders.kind,
      status: emailMessages.status,
      providerMessageId: emailMessages.providerMessageId,
      providerStatus: emailMessages.providerStatus,
      errorMessage: emailMessages.errorMessage,
      createdAt: emailMessages.createdAt,
      sentAt: emailMessages.sentAt,
      deliveredAt: emailMessages.deliveredAt,
    })
    .from(emailMessages)
    .leftJoin(emailProviders, eq(emailProviders.id, emailMessages.providerId))
    .where(where)
    .orderBy(desc(emailMessages.createdAt))
    .limit(options.perPage)
    .offset((options.page - 1) * options.perPage);
  return {
    items: rows,
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages: Math.ceil(total / options.perPage),
  };
}

export async function getEmailOverview(): Promise<EmailOverview> {
  const [statsRow] = await db
    .select({
      total: count(),
      sent: sql<number>`count(*) filter (where ${emailMessages.status} in ('sent', 'delivered'))`,
      delivered: sql<number>`count(*) filter (where ${emailMessages.status} = 'delivered')`,
      failed: sql<number>`count(*) filter (where ${emailMessages.status} = 'failed')`,
    })
    .from(emailMessages);
  const providerRows = await db
    .select({
      id: emailProviders.id,
      name: emailProviders.name,
      kind: emailProviders.kind,
      hostEncrypted: emailProviders.hostEncrypted,
      passwordLast4: emailProviders.passwordLast4,
      healthStatus: emailProviders.healthStatus,
      isActive: emailProviders.isActive,
      isDefault: emailProviders.isDefault,
      lastHealthCheckedAt: emailProviders.lastHealthCheckedAt,
    })
    .from(emailProviders)
    .where(sql`${emailProviders.deletedAt} IS NULL`)
    .orderBy(desc(emailProviders.isDefault), desc(emailProviders.updatedAt));
  const recentRows = await db
    .select({
      id: emailMessages.id,
      recipientMasked: emailMessages.recipientMasked,
      providerName: emailProviders.name,
      providerKind: emailProviders.kind,
      status: emailMessages.status,
      providerMessageId: emailMessages.providerMessageId,
      providerStatus: emailMessages.providerStatus,
      errorMessage: emailMessages.errorMessage,
      createdAt: emailMessages.createdAt,
      sentAt: emailMessages.sentAt,
      deliveredAt: emailMessages.deliveredAt,
    })
    .from(emailMessages)
    .leftJoin(emailProviders, eq(emailProviders.id, emailMessages.providerId))
    .orderBy(desc(emailMessages.createdAt))
    .limit(EMAIL_LIMITS.recentMessageCount);
  const [providerCountRow] = await db
    .select({ total: count(), active: sql<number>`count(*) filter (where ${emailProviders.isActive})` })
    .from(emailProviders)
    .where(sql`${emailProviders.deletedAt} IS NULL`);
  const [templateCountRow] = await db
    .select({ total: count(), active: sql<number>`count(*) filter (where ${emailTemplates.isActive})` })
    .from(emailTemplates)
    .where(sql`${emailTemplates.deletedAt} IS NULL`);
  const total = Number(statsRow?.total ?? 0);
  const delivered = Number(statsRow?.delivered ?? 0);
  return {
    stats: {
      total,
      sent: Number(statsRow?.sent ?? 0),
      delivered,
      failed: Number(statsRow?.failed ?? 0),
      deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
    },
    providerCount: Number(providerCountRow?.total ?? 0),
    activeProviderCount: Number(providerCountRow?.active ?? 0),
    templateCount: Number(templateCountRow?.total ?? 0),
    activeTemplateCount: Number(templateCountRow?.active ?? 0),
    providers: providerRows.map(({ hostEncrypted, ...provider }) => ({
      ...provider,
      host: decryptSecret(hostEncrypted),
    })),
    recentMessages: recentRows,
  };
}

function messageConditions(options: ListEmailMessagesQuery): SQL[] {
  const conditions: SQL[] = [];
  if (options.status !== "all") conditions.push(eq(emailMessages.status, options.status));
  if (options.providerId) conditions.push(eq(emailMessages.providerId, options.providerId));
  if (options.search) {
    const conditionsForSearch: SQL[] = [
      ilike(emailMessages.providerMessageId, `%${options.search}%`),
    ];
    const recipientHash = hashRecipient(options.search);
    conditionsForSearch.push(eq(emailMessages.recipientHash, recipientHash));
    const searchCondition = or(...conditionsForSearch);
    if (searchCondition) conditions.push(searchCondition);
  }
  return conditions;
}

export type EmailAdminDatasets = {
  providers: ListEmailProvidersResult;
  templates: ListEmailTemplatesResult;
  providerItems: AdminEmailProvider[];
  templateItems: AdminEmailTemplate[];
};

export type EmailRecipient = {
  id: string;
  fullName: string;
  email: string;
};

export type ListEmailRecipientsResult = {
  items: EmailRecipient[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listEmailRecipients(
  options: ListEmailRecipientsQuery,
): Promise<ListEmailRecipientsResult> {
  const conditions: SQL[] = [
    isNull(users.deletedAt),
    eq(users.isActive, true),
    eq(users.isBanned, false),
    sql`${users.email} IS NOT NULL`,
  ];
  if (options.search) {
    const term = `%${options.search}%`;
    const searchCondition = or(
      ilike(users.fullName, term),
      ilike(users.email, term),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = and(...conditions);
  const [countRow] = await db.select({ value: count() }).from(users).where(where);
  const rows = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(options.perPage)
    .offset((options.page - 1) * options.perPage);
  const total = Number(countRow?.value ?? 0);
  return {
    items: rows.filter((row): row is EmailRecipient => row.email !== null),
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages: Math.ceil(total / options.perPage),
  };
}

export async function getEmailComposeDatasets(): Promise<EmailAdminDatasets> {
  const providers = await listEmailProviders({
    page: EMAIL_LIMITS.pageDefault,
    perPage: EMAIL_LIMITS.providerListPerPageMax,
    status: "active",
  } satisfies ListEmailProvidersQuery);
  const templates = await listEmailTemplates({
    page: EMAIL_LIMITS.pageDefault,
    perPage: EMAIL_LIMITS.templateListPerPageMax,
    status: "active",
  } satisfies ListEmailTemplatesQuery);
  return {
    providers,
    templates,
    providerItems: providers.items,
    templateItems: templates.items,
  };
}