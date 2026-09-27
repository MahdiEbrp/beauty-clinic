import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Durable counter used to version every public content cache (landing, catalog
 * tree, nav, rules, …).
 *
 * It lives in Postgres (not the optional Redis cache) so a single bump is seen
 * by every server instance and process. An in-process-only counter cannot
 * coordinate invalidation across multiple instances, which made edited content
 * flip-flop between old and new depending on which instance served a request.
 */
export const contentVersions = pgTable("content_versions", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type NewContentVersion = typeof contentVersions.$inferInsert;
