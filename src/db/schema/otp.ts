import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export type OtpChannel = "sms" | "email";

/**
 * One-time login codes. Codes are stored as a sha256 hash (never plaintext);
 * each code row tracks verify attempts, resends and its expiry, and is
 * "consumed" (consumed_at set) on success, expiry, or attempt exhaustion so a
 * code can never be reused.
 */
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull().default("login"),
    channel: text("channel", { enum: ["sms", "email"] }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    resends: integer("resends").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("otp_codes_user_active_idx")
      .on(table.userId, table.consumedAt)
      .where(sql`${table.purpose} = 'login'`),
    /*
     * At most one verifiable login code per user. Without this, two concurrent
     * `issueLoginOtp` calls can both consume the old codes and insert fresh
     * ones, leaving two active rows that both verify — an account-takeover
     * vector. The partial index makes the second insert fail instead.
     */
    uniqueIndex("otp_codes_login_active_one_per_user")
      .on(table.userId)
      .where(
        sql`${table.purpose} = 'login' AND ${table.consumedAt} IS NULL`,
      ),
  ],
);

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, { fields: [otpCodes.userId], references: [users.id] }),
}));

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
