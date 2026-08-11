import { relations } from "drizzle-orm";
import { bigint, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";

export const storageNodes = pgTable(
  "storage_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    path: text("path").notNull(),
    type: text("type", { enum: ["file", "folder"] }).notNull(),
    size: bigint("size", { mode: "number" }).notNull().default(0),
    mime: text("mime"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("storage_nodes_path_idx").on(table.path),
    index("storage_nodes_trashed_at_idx").on(table.trashedAt),
    index("storage_nodes_created_by_idx").on(table.createdBy),
  ],
);

export const storageNodesRelations = relations(storageNodes, ({ one }) => ({
  creator: one(users, { fields: [storageNodes.createdBy], references: [users.id] }),
}));

export type StorageNode = typeof storageNodes.$inferSelect;
export type NewStorageNode = typeof storageNodes.$inferInsert;
