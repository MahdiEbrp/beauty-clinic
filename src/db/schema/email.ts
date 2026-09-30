import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
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

export const emailProviderKindEnum = pgEnum("email_provider_kind", [
  "gmail",
  "outlook",
  "yahoo",
  "custom",
  "liara",
  "fake",
]);

export const emailEncryptionEnum = pgEnum("email_encryption", [
  "ssl",
  "starttls",
  "none",
]);

export const emailHealthStatusEnum = pgEnum("email_health_status", [
  "unknown",
  "healthy",
  "unhealthy",
]);

export const emailMessageTypeEnum = pgEnum("email_message_type", [
  "transactional",
  "marketing",
]);

export const emailContentFormatEnum = pgEnum("email_content_format", [
  "plain",
  "html",
]);

export const emailCampaignStatusEnum = pgEnum("email_campaign_status", [
  "queued",
  "sending",
  "sent",
  "partial",
  "failed",
]);

export const emailMessageStatusEnum = pgEnum("email_message_status", [
  "queued",
  "sending",
  "sent",
  "delivered",
  "failed",
]);

export const emailProviders = pgTable(
  "email_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    kind: emailProviderKindEnum("kind").notNull(),
    hostEncrypted: text("host_encrypted").notNull(),
    portEncrypted: text("port_encrypted").notNull(),
    usernameEncrypted: text("username_encrypted").notNull(),
    passwordEncrypted: text("password_encrypted").notNull(),
    passwordLast4: text("password_last4").notNull().default(""),
    encryption: emailEncryptionEnum("encryption").notNull().default("ssl"),
    fromEmail: text("from_email"),
    fromName: text("from_name"),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    healthStatus: emailHealthStatusEnum("health_status").notNull().default("unknown"),
    lastHealthCheckedAt: timestamp("last_health_checked_at", { withTimezone: true }),
    lastHealthError: text("last_health_error"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("email_providers_active_idx").on(table.isActive, table.deletedAt),
    index("email_providers_health_idx").on(table.healthStatus, table.lastHealthCheckedAt),
    uniqueIndex("email_providers_default_idx")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true AND ${table.deletedAt} IS NULL`),
  ],
);

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    externalTemplateId: text("external_template_id"),
    messageType: emailMessageTypeEnum("message_type").notNull().default("transactional"),
    contentFormat: emailContentFormatEnum("content_format").notNull().default("html"),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("email_templates_key_idx")
      .on(table.key)
      .where(sql`${table.deletedAt} IS NULL`),
    index("email_templates_active_order_idx").on(
      table.isActive,
      table.displayOrder,
      table.deletedAt,
    ),
  ],
);

export const emailTemplatesI18n = pgTable(
  "email_templates_i18n",
  {
    templateId: uuid("template_id")
      .notNull()
      .references(() => emailTemplates.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    content: text("content").notNull(),
  },
  (table) => [primaryKey({ columns: [table.templateId, table.locale] })],
);

export const emailCampaigns = pgTable(
  "email_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    providerId: uuid("provider_id").references(() => emailProviders.id, { onDelete: "set null" }),
    templateId: uuid("template_id").references(() => emailTemplates.id, { onDelete: "set null" }),
    messageType: emailMessageTypeEnum("message_type").notNull().default("transactional"),
    contentFormat: emailContentFormatEnum("content_format").notNull().default("html"),
    fromEmail: text("from_email"),
    totalRecipients: integer("total_recipients").notNull().default(0),
    sentCount: integer("sent_count").notNull().default(0),
    deliveredCount: integer("delivered_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    status: emailCampaignStatusEnum("status").notNull().default("queued"),
    idempotencyKey: text("idempotency_key"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("email_campaigns_status_created_idx").on(table.status, table.createdAt),
    index("email_campaigns_provider_idx").on(table.providerId, table.createdAt),
    uniqueIndex("email_campaigns_idempotency_idx")
      .on(table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL`),
  ],
);

export const emailMessages = pgTable(
  "email_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id").references(() => emailCampaigns.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id").references(() => emailProviders.id, { onDelete: "set null" }),
    templateId: uuid("template_id").references(() => emailTemplates.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    recipientEncrypted: text("recipient_encrypted").notNull(),
    recipientHash: text("recipient_hash").notNull(),
    recipientMasked: text("recipient_masked").notNull(),
    subjectEncrypted: text("subject_encrypted").notNull(),
    bodyEncrypted: text("body_encrypted").notNull(),
    fromEmail: text("from_email"),
    status: emailMessageStatusEnum("status").notNull().default("queued"),
    providerMessageId: text("provider_message_id"),
    providerStatus: text("provider_status"),
    providerResponseCode: integer("provider_response_code"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("email_messages_campaign_idx").on(table.campaignId),
    index("email_messages_status_created_idx").on(table.status, table.createdAt),
    index("email_messages_provider_idx").on(table.providerId, table.createdAt),
    index("email_messages_recipient_hash_idx").on(table.recipientHash),
    index("email_messages_provider_message_idx").on(table.providerMessageId),
  ],
);

export const emailProviderChecks = pgTable(
  "email_provider_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => emailProviders.id, { onDelete: "cascade" }),
    checkedBy: uuid("checked_by").references(() => users.id, { onDelete: "set null" }),
    isSuccessful: boolean("is_successful").notNull(),
    responseTimeMs: integer("response_time_ms"),
    statusCode: integer("status_code"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("email_provider_checks_provider_created_idx").on(table.providerId, table.createdAt),
  ],
);

export const emailProvidersRelations = relations(emailProviders, ({ one, many }) => ({
  creator: one(users, { fields: [emailProviders.createdBy], references: [users.id] }),
  campaigns: many(emailCampaigns),
  messages: many(emailMessages),
  checks: many(emailProviderChecks),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
  creator: one(users, { fields: [emailTemplates.createdBy], references: [users.id] }),
  i18n: many(emailTemplatesI18n),
  campaigns: many(emailCampaigns),
  messages: many(emailMessages),
}));

export const emailTemplatesI18nRelations = relations(emailTemplatesI18n, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailTemplatesI18n.templateId],
    references: [emailTemplates.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  provider: one(emailProviders, {
    fields: [emailCampaigns.providerId],
    references: [emailProviders.id],
  }),
  template: one(emailTemplates, {
    fields: [emailCampaigns.templateId],
    references: [emailTemplates.id],
  }),
  creator: one(users, { fields: [emailCampaigns.createdBy], references: [users.id] }),
  messages: many(emailMessages),
}));

export const emailMessagesRelations = relations(emailMessages, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [emailMessages.campaignId],
    references: [emailCampaigns.id],
  }),
  provider: one(emailProviders, {
    fields: [emailMessages.providerId],
    references: [emailProviders.id],
  }),
  template: one(emailTemplates, {
    fields: [emailMessages.templateId],
    references: [emailTemplates.id],
  }),
  creator: one(users, { fields: [emailMessages.createdBy], references: [users.id] }),
}));

export const emailProviderChecksRelations = relations(emailProviderChecks, ({ one }) => ({
  provider: one(emailProviders, {
    fields: [emailProviderChecks.providerId],
    references: [emailProviders.id],
  }),
  checker: one(users, { fields: [emailProviderChecks.checkedBy], references: [users.id] }),
}));

export type EmailProviderKind = (typeof emailProviderKindEnum.enumValues)[number];
export type EmailEncryption = (typeof emailEncryptionEnum.enumValues)[number];
export type EmailHealthStatus = (typeof emailHealthStatusEnum.enumValues)[number];
export type EmailMessageType = (typeof emailMessageTypeEnum.enumValues)[number];
export type EmailContentFormat = (typeof emailContentFormatEnum.enumValues)[number];
export type EmailCampaignStatus = (typeof emailCampaignStatusEnum.enumValues)[number];
export type EmailMessageStatus = (typeof emailMessageStatusEnum.enumValues)[number];
export type EmailProvider = typeof emailProviders.$inferSelect;
export type NewEmailProvider = typeof emailProviders.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type EmailProviderCheck = typeof emailProviderChecks.$inferSelect;