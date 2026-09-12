import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";

export const paymentProviderKindEnum = pgEnum("payment_provider_kind", [
  "zarinpal",
  "zibal",
  "idpay",
  "nextpay",
  "mellat",
  "parsian",
  "fake",
]);

export const paymentHealthStatusEnum = pgEnum("payment_health_status", [
  "unknown",
  "healthy",
  "unhealthy",
]);

export const paymentTransactionStatusEnum = pgEnum("payment_transaction_status", [
  "pending",
  "requested",
  "verified",
  "failed",
  "refunded",
  "cancelled",
]);

export const paymentProviders = pgTable(
  "payment_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    kind: paymentProviderKindEnum("kind").notNull(),
    merchantIdEncrypted: text("merchant_id_encrypted").notNull(),
    apiUrlEncrypted: text("api_url_encrypted").notNull(),
    settingsEncrypted: text("settings_encrypted").notNull(),
    merchantLast4: text("merchant_last4").notNull().default(""),
    callbackUrl: text("callback_url"),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    healthStatus: paymentHealthStatusEnum("health_status").notNull().default("unknown"),
    lastHealthCheckedAt: timestamp("last_health_checked_at", { withTimezone: true }),
    lastHealthError: text("last_health_error"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("payment_providers_active_idx").on(table.isActive, table.deletedAt),
    index("payment_providers_health_idx").on(table.healthStatus, table.lastHealthCheckedAt),
    // eslint-disable-next-line no-secrets/no-secrets -- database index name, not a credential
    uniqueIndex("payment_providers_default_idx")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true AND ${table.deletedAt} IS NULL`),
  ],
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id").references(() => paymentProviders.id, { onDelete: "set null" }),
    bookingGroupRef: text("booking_group_ref").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("تومان"),
    description: text("description"),
    /** Stable browser checkout key; prevents duplicate payment requests. */
    idempotencyKey: text("idempotency_key").unique(),
    /** Locale captured at checkout; never trust callback query parameters. */
    locale: text("locale").notNull().default("fa"),
    /** Browser redirect URL returned by the payment provider. */
    paymentUrl: text("payment_url"),
    authority: text("authority").unique(),
    refId: text("ref_id"),
    cardPan: text("card_pan"),
    status: paymentTransactionStatusEnum("status").notNull().default("pending"),
    callbackUrl: text("callback_url"),
    /** The unpaid reservation hold ends at this server-controlled instant. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("payment_transactions_group_ref_idx").on(table.bookingGroupRef),
    index("payment_transactions_authority_idx").on(table.authority),
    index("payment_transactions_idempotency_idx").on(table.idempotencyKey),
    index("payment_transactions_provider_created_idx").on(table.providerId, table.createdAt),
    index("payment_transactions_status_created_idx").on(table.status, table.createdAt),
    index("payment_transactions_expiry_idx").on(table.status, table.expiresAt),
    // eslint-disable-next-line no-secrets/no-secrets -- database index name, not a credential
    uniqueIndex("payment_transactions_live_group_ref_idx")
      .on(table.bookingGroupRef)
      .where(sql`${table.status} IN ('pending', 'requested')`),
  ],
);

export const paymentProviderChecks = pgTable(
  "payment_provider_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => paymentProviders.id, { onDelete: "cascade" }),
    checkedBy: uuid("checked_by").references(() => users.id, { onDelete: "set null" }),
    isSuccessful: boolean("is_successful").notNull(),
    responseTimeMs: integer("response_time_ms"),
    statusCode: integer("status_code"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("payment_provider_checks_provider_created_idx").on(table.providerId, table.createdAt),
  ],
);

export const paymentProvidersRelations = relations(paymentProviders, ({ one, many }) => ({
  creator: one(users, { fields: [paymentProviders.createdBy], references: [users.id] }),
  transactions: many(paymentTransactions),
  checks: many(paymentProviderChecks),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  provider: one(paymentProviders, {
    fields: [paymentTransactions.providerId],
    references: [paymentProviders.id],
  }),
  creator: one(users, { fields: [paymentTransactions.createdBy], references: [users.id] }),
}));

export const paymentProviderChecksRelations = relations(paymentProviderChecks, ({ one }) => ({
  provider: one(paymentProviders, {
    fields: [paymentProviderChecks.providerId],
    references: [paymentProviders.id],
  }),
  checker: one(users, { fields: [paymentProviderChecks.checkedBy], references: [users.id] }),
}));

export type PaymentProviderKind = (typeof paymentProviderKindEnum.enumValues)[number];
export type PaymentHealthStatus = (typeof paymentHealthStatusEnum.enumValues)[number];
export type PaymentTransactionStatus = (typeof paymentTransactionStatusEnum.enumValues)[number];
export type PaymentProvider = typeof paymentProviders.$inferSelect;
export type NewPaymentProvider = typeof paymentProviders.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type PaymentProviderCheck = typeof paymentProviderChecks.$inferSelect;
