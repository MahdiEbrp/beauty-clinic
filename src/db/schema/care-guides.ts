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

export const careGuides = pgTable(
  "care_guides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    icon: text("icon"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("care_guides_slug_idx").on(table.slug)],
);

export const careGuidesI18n = pgTable(
  "care_guides_i18n",
  {
    guideId: uuid("guide_id")
      .notNull()
      .references(() => careGuides.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [primaryKey({ columns: [table.guideId, table.locale] })],
);

export const careGuideItems = pgTable(
  "care_guide_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guideId: uuid("guide_id")
      .notNull()
      .references(() => careGuides.id, { onDelete: "cascade" }),
    highlighted: boolean("highlighted").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("care_guide_items_guide_order_idx").on(
      table.guideId,
      table.displayOrder,
    ),
  ],
);

export const careGuideItemsI18n = pgTable(
  "care_guide_items_i18n",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => careGuideItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    description: text("description"),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.locale] })],
);

export const careGuidesRelations = relations(careGuides, ({ many }) => ({
  i18n: many(careGuidesI18n),
  items: many(careGuideItems),
}));

export const careGuidesI18nRelations = relations(careGuidesI18n, ({ one }) => ({
  guide: one(careGuides, { fields: [careGuidesI18n.guideId], references: [careGuides.id] }),
}));

export const careGuideItemsRelations = relations(careGuideItems, ({ many, one }) => ({
  guide: one(careGuides, { fields: [careGuideItems.guideId], references: [careGuides.id] }),
  i18n: many(careGuideItemsI18n),
}));

export const careGuideItemsI18nRelations = relations(careGuideItemsI18n, ({ one }) => ({
  item: one(careGuideItems, {
    fields: [careGuideItemsI18n.itemId],
    references: [careGuideItems.id],
  }),
}));

export type CareGuide = typeof careGuides.$inferSelect;
export type NewCareGuide = typeof careGuides.$inferInsert;
export type CareGuideI18n = typeof careGuidesI18n.$inferSelect;
export type NewCareGuideI18n = typeof careGuidesI18n.$inferInsert;
export type CareGuideItem = typeof careGuideItems.$inferSelect;
export type NewCareGuideItem = typeof careGuideItems.$inferInsert;
export type CareGuideItemI18n = typeof careGuideItemsI18n.$inferSelect;
export type NewCareGuideItemI18n = typeof careGuideItemsI18n.$inferInsert;
