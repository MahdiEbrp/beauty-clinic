import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const rules = pgTable(
  "rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    icon: text("icon"),
    image: text("image"),
    color: text("color"),
    highlighted: boolean("highlighted").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("rules_slug_idx").on(table.slug),
  ],
);

export const rulesI18n = pgTable(
  "rules_i18n",
  {
    ruleId: uuid("rule_id")
      .notNull()
      .references(() => rules.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [primaryKey({ columns: [table.ruleId, table.locale] })],
);

export const rulesRelations = relations(rules, ({ many }) => ({
  i18n: many(rulesI18n),
}));

export const rulesI18nRelations = relations(rulesI18n, ({ one }) => ({
  rule: one(rules, { fields: [rulesI18n.ruleId], references: [rules.id] }),
}));

export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type RuleI18n = typeof rulesI18n.$inferSelect;
export type NewRuleI18n = typeof rulesI18n.$inferInsert;
