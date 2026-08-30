import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { decryptSecret } from "@/lib/auth/encryption";
import { SMS_LIMITS } from "@/lib/sms/constants";
import { hashRecipient } from "@/lib/sms/phone";
import type {
  ListSmsMessagesQuery,
  ListSmsProvidersQuery,
  ListSmsTemplatesQuery,
} from "@/lib/validation/sms";
import { db } from "@/src/db";
import {
  smsMessages,
  smsProviders,
  type SmsHealthStatus,
  type SmsMessageStatus,
  type SmsProviderKind,
} from "@/src/db/schema";
import type { AdminSmsProvider, ListSmsProvidersResult } from "./provider-service";
import type { AdminSmsTemplate, ListSmsTemplatesResult } from "./template-service";
import { listSmsProviders } from "./provider-service";
import { listSmsTemplates } from "./template-service";

export type AdminSmsMessage = {
  id: string;
  recipientMasked: string;
  providerName: string | null;
  providerKind: SmsProviderKind | null;
  status: SmsMessageStatus;
  providerMessageId: string | null;
  providerStatus: string | null;
  errorMessage: string | null;
  createdAt: Date;
  sentAt: Date | null;
  deliveredAt: Date | null;
};

export type ListSmsMessagesResult = {
  items: AdminSmsMessage[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type SmsOverview = {
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  };
  providers: Array<{
    id: string;
    name: string;
    kind: SmsProviderKind;
    apiUrl: string;
    tokenLast4: string;
    healthStatus: SmsHealthStatus;
    isActive: boolean;
    isDefault: boolean;
    lastHealthCheckedAt: Date | null;
  }>;
  recentMessages: AdminSmsMessage[];
};

export async function listSmsMessages(
  options: ListSmsMessagesQuery,
): Promise<ListSmsMessagesResult> {
  const where = and(...messageConditions(options));
  const [countRow] = await db
    .select({ value: count() })
    .from(smsMessages)
    .leftJoin(smsProviders, eq(smsProviders.id, smsMessages.providerId))
    .where(where);
  const total = countRow?.value ?? 0;
  const rows = await db
    .select({
      id: smsMessages.id,
      recipientMasked: smsMessages.recipientMasked,
      providerName: smsProviders.name,
      providerKind: smsProviders.kind,
      status: smsMessages.status,
      providerMessageId: smsMessages.providerMessageId,
      providerStatus: smsMessages.providerStatus,
      errorMessage: smsMessages.errorMessage,
      createdAt: smsMessages.createdAt,
      sentAt: smsMessages.sentAt,
      deliveredAt: smsMessages.deliveredAt,
    })
    .from(smsMessages)
    .leftJoin(smsProviders, eq(smsProviders.id, smsMessages.providerId))
    .where(where)
    .orderBy(desc(smsMessages.createdAt))
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

export async function getSmsOverview(): Promise<SmsOverview> {
  const [statsRow] = await db
    .select({
      total: count(),
      sent: sql<number>`count(*) filter (where ${smsMessages.status} in ('sent', 'delivered'))`,
      delivered: sql<number>`count(*) filter (where ${smsMessages.status} = 'delivered')`,
      failed: sql<number>`count(*) filter (where ${smsMessages.status} = 'failed')`,
    })
    .from(smsMessages);
  const providerRows = await db
    .select({
      id: smsProviders.id,
      name: smsProviders.name,
      kind: smsProviders.kind,
      apiUrlEncrypted: smsProviders.apiUrlEncrypted,
      tokenLast4: smsProviders.tokenLast4,
      healthStatus: smsProviders.healthStatus,
      isActive: smsProviders.isActive,
      isDefault: smsProviders.isDefault,
      lastHealthCheckedAt: smsProviders.lastHealthCheckedAt,
    })
    .from(smsProviders)
    .where(sql`${smsProviders.deletedAt} IS NULL`)
    .orderBy(desc(smsProviders.isDefault), desc(smsProviders.updatedAt));
  const recentRows = await db
    .select({
      id: smsMessages.id,
      recipientMasked: smsMessages.recipientMasked,
      providerName: smsProviders.name,
      providerKind: smsProviders.kind,
      status: smsMessages.status,
      providerMessageId: smsMessages.providerMessageId,
      providerStatus: smsMessages.providerStatus,
      errorMessage: smsMessages.errorMessage,
      createdAt: smsMessages.createdAt,
      sentAt: smsMessages.sentAt,
      deliveredAt: smsMessages.deliveredAt,
    })
    .from(smsMessages)
    .leftJoin(smsProviders, eq(smsProviders.id, smsMessages.providerId))
    .orderBy(desc(smsMessages.createdAt))
    .limit(SMS_LIMITS.recentMessageCount);
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
    providers: providerRows.map(({ apiUrlEncrypted, ...provider }) => ({
      ...provider,
      apiUrl: decryptSecret(apiUrlEncrypted),
    })),
    recentMessages: recentRows,
  };
}

function messageConditions(options: ListSmsMessagesQuery): SQL[] {
  const conditions: SQL[] = [];
  if (options.status !== "all") conditions.push(eq(smsMessages.status, options.status));
  if (options.providerId) conditions.push(eq(smsMessages.providerId, options.providerId));
  if (options.search) {
    const conditionsForSearch: SQL[] = [
      ilike(smsMessages.providerMessageId, `%${options.search}%`),
    ];
    const recipientHash = hashRecipient(options.search);
    conditionsForSearch.push(eq(smsMessages.recipientHash, recipientHash));
    conditions.push(or(...conditionsForSearch)!);
  }
  return conditions;
}

export type SmsAdminDatasets = {
  providers: ListSmsProvidersResult;
  templates: ListSmsTemplatesResult;
  providerItems: AdminSmsProvider[];
  templateItems: AdminSmsTemplate[];
};

export async function getSmsComposeDatasets(): Promise<SmsAdminDatasets> {
  const providers = await listSmsProviders({
    page: SMS_LIMITS.pageDefault,
    perPage: SMS_LIMITS.providerListPerPageMax,
    status: "active",
  } satisfies ListSmsProvidersQuery);
  const templates = await listSmsTemplates({
    page: SMS_LIMITS.pageDefault,
    perPage: SMS_LIMITS.templateListPerPageMax,
    status: "active",
  } satisfies ListSmsTemplatesQuery);
  return {
    providers,
    templates,
    providerItems: providers.items,
    templateItems: templates.items,
  };
}
