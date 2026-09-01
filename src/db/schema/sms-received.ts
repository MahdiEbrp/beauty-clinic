import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { smsProviders } from "./sms";

export const smsReceivedMessages = pgTable(
  "sms_received_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id").references(() => smsProviders.id, {
      onDelete: "set null",
    }),
    receiveReturnId: text("receive_return_id").notNull(),
    number: text("number").notNull(),
    mobileEncrypted: text("mobile_encrypted").notNull(),
    mobileHash: text("mobile_hash").notNull(),
    messageEncrypted: text("message_encrypted").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("sms_received_return_idx").on(
      table.providerId,
      table.receiveReturnId,
    ),
    index("sms_received_received_at_idx").on(table.receivedAt),
  ],
);

export const smsReceivedMessagesRelations = relations(smsReceivedMessages, ({ one }) => ({
  provider: one(smsProviders, {
    fields: [smsReceivedMessages.providerId],
    references: [smsProviders.id],
  }),
}));

export type SmsReceivedMessage = typeof smsReceivedMessages.$inferSelect;
