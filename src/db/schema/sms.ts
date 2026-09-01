import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { localeEnum } from "./service-catalog";
import { users } from "./auth";

export const smsProviderKindEnum = pgEnum("sms_provider_kind", [
  "kavenegar",
  "sms_ir",
  "ippanel",
  "melipayamak",
  "custom",
  "fake",
]);

export const smsHealthStatusEnum = pgEnum("sms_health_status", [
  "unknown",
  "healthy",
  "unhealthy",
]);

export const smsMessageTypeEnum = pgEnum("sms_message_type", [
  "transactional",
  "marketing",
]);

export const smsCampaignStatusEnum = pgEnum("sms_campaign_status", [
  "queued",
  "sending",
  "sent",
  "partial",
  "failed",
]);

export const smsMessageStatusEnum = pgEnum("sms_message_status", [
  "queued",
  "sending",
  "sent",
  "delivered",
  "failed",
]);

export const smsProviders = pgTable(
  "sms_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    kind: smsProviderKindEnum("kind").notNull(),
    apiUrlEncrypted: text("api_url_encrypted").notNull(),
    tokenEncrypted: text("token_encrypted").notNull(),
    settingsEncrypted: text("settings_encrypted").notNull(),
    tokenLast4: text("token_last4").notNull().default(""),
    sender: text("sender"),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    healthStatus: smsHealthStatusEnum("health_status").notNull().default("unknown"),
    lastHealthCheckedAt: timestamp("last_health_checked_at", { withTimezone: true }),
    lastHealthError: text("last_health_error"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("sms_providers_active_idx").on(table.isActive, table.deletedAt),
    index("sms_providers_health_idx").on(table.healthStatus, table.lastHealthCheckedAt),
    uniqueIndex("sms_providers_default_idx")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true AND ${table.deletedAt} IS NULL`),
  ],
);

export const smsTemplates = pgTable(
  "sms_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    externalTemplateId: text("external_template_id"),
    messageType: smsMessageTypeEnum("message_type").notNull().default("transactional"),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sms_templates_key_idx")
      .on(table.key)
      .where(sql`${table.deletedAt} IS NULL`),
    index("sms_templates_active_order_idx").on(
      table.isActive,
      table.displayOrder,
      table.deletedAt,
    ),
  ],
);

export const smsTemplatesI18n = pgTable(
  "sms_templates_i18n",
  {
    templateId: uuid("template_id")
      .notNull()
      .references(() => smsTemplates.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    content: text("content").notNull(),
  },
  (table) => [primaryKey({ columns: [table.templateId, table.locale] })],
);

export const smsCampaigns = pgTable(
  "sms_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    providerId: uuid("provider_id").references(() => smsProviders.id, { onDelete: "set null" }),
    templateId: uuid("template_id").references(() => smsTemplates.id, { onDelete: "set null" }),
    messageType: smsMessageTypeEnum("message_type").notNull().default("transactional"),
    sender: text("sender"),
    totalRecipients: integer("total_recipients").notNull().default(0),
    sentCount: integer("sent_count").notNull().default(0),
    deliveredCount: integer("delivered_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    status: smsCampaignStatusEnum("status").notNull().default("queued"),
    idempotencyKey: text("idempotency_key"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("sms_campaigns_status_created_idx").on(table.status, table.createdAt),
    index("sms_campaigns_provider_idx").on(table.providerId, table.createdAt),
    uniqueIndex("sms_campaigns_idempotency_idx")
      .on(table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL`),
  ],
);

export const smsMessages = pgTable(
  "sms_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id").references(() => smsCampaigns.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id").references(() => smsProviders.id, { onDelete: "set null" }),
    templateId: uuid("template_id").references(() => smsTemplates.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    recipientEncrypted: text("recipient_encrypted").notNull(),
    recipientHash: text("recipient_hash").notNull(),
    recipientMasked: text("recipient_masked").notNull(),
    bodyEncrypted: text("body_encrypted").notNull(),
    sender: text("sender"),
    status: smsMessageStatusEnum("status").notNull().default("queued"),
    providerMessageId: text("provider_message_id"),
    providerStatus: text("provider_status"),
    providerResponseCode: integer("provider_response_code"),
    cost: numeric("cost", { precision: 12, scale: 4 }),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sms_messages_campaign_idx").on(table.campaignId),
    index("sms_messages_status_created_idx").on(table.status, table.createdAt),
    index("sms_messages_provider_idx").on(table.providerId, table.createdAt),
    index("sms_messages_recipient_hash_idx").on(table.recipientHash),
    index("sms_messages_provider_message_idx").on(table.providerMessageId),
  ],
);

export const smsProviderChecks = pgTable(
  "sms_provider_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => smsProviders.id, { onDelete: "cascade" }),
    checkedBy: uuid("checked_by").references(() => users.id, { onDelete: "set null" }),
    isSuccessful: boolean("is_successful").notNull(),
    responseTimeMs: integer("response_time_ms"),
    statusCode: integer("status_code"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sms_provider_checks_provider_created_idx").on(table.providerId, table.createdAt),
  ],
);

export const smsProvidersRelations = relations(smsProviders, ({ one, many }) => ({
  creator: one(users, { fields: [smsProviders.createdBy], references: [users.id] }),
  campaigns: many(smsCampaigns),
  messages: many(smsMessages),
  checks: many(smsProviderChecks),
}));

export const smsTemplatesRelations = relations(smsTemplates, ({ one, many }) => ({
  creator: one(users, { fields: [smsTemplates.createdBy], references: [users.id] }),
  i18n: many(smsTemplatesI18n),
  campaigns: many(smsCampaigns),
  messages: many(smsMessages),
}));

export const smsTemplatesI18nRelations = relations(smsTemplatesI18n, ({ one }) => ({
  template: one(smsTemplates, {
    fields: [smsTemplatesI18n.templateId],
    references: [smsTemplates.id],
  }),
}));

export const smsCampaignsRelations = relations(smsCampaigns, ({ one, many }) => ({
  provider: one(smsProviders, {
    fields: [smsCampaigns.providerId],
    references: [smsProviders.id],
  }),
  template: one(smsTemplates, {
    fields: [smsCampaigns.templateId],
    references: [smsTemplates.id],
  }),
  creator: one(users, { fields: [smsCampaigns.createdBy], references: [users.id] }),
  messages: many(smsMessages),
}));

export const smsMessagesRelations = relations(smsMessages, ({ one }) => ({
  campaign: one(smsCampaigns, {
    fields: [smsMessages.campaignId],
    references: [smsCampaigns.id],
  }),
  provider: one(smsProviders, {
    fields: [smsMessages.providerId],
    references: [smsProviders.id],
  }),
  template: one(smsTemplates, {
    fields: [smsMessages.templateId],
    references: [smsTemplates.id],
  }),
  creator: one(users, { fields: [smsMessages.createdBy], references: [users.id] }),
}));

export const smsProviderChecksRelations = relations(smsProviderChecks, ({ one }) => ({
  provider: one(smsProviders, {
    fields: [smsProviderChecks.providerId],
    references: [smsProviders.id],
  }),
  checker: one(users, { fields: [smsProviderChecks.checkedBy], references: [users.id] }),
}));

export type SmsProviderKind = (typeof smsProviderKindEnum.enumValues)[number];
export type SmsHealthStatus = (typeof smsHealthStatusEnum.enumValues)[number];
export type SmsMessageType = (typeof smsMessageTypeEnum.enumValues)[number];
export type SmsCampaignStatus = (typeof smsCampaignStatusEnum.enumValues)[number];
export type SmsMessageStatus = (typeof smsMessageStatusEnum.enumValues)[number];
export type SmsProvider = typeof smsProviders.$inferSelect;
export type NewSmsProvider = typeof smsProviders.$inferInsert;
export type SmsTemplate = typeof smsTemplates.$inferSelect;
export type NewSmsTemplate = typeof smsTemplates.$inferInsert;
export type SmsCampaign = typeof smsCampaigns.$inferSelect;
export type SmsMessage = typeof smsMessages.$inferSelect;
export type SmsProviderCheck = typeof smsProviderChecks.$inferSelect;
