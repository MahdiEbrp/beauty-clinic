import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { localeEnum } from "./service-catalog";

/**
 * Weekly working hours — one row per open weekday (English names, the same
 * set used by the booking calendar). Capacity is the default seat count the
 * auto-slot generator applies to slots created inside this window.
 */
export const workingHours = pgTable(
  "working_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    day: text("day").notNull(),
    opens: time("opens").notNull(),
    closes: time("closes").notNull(),
    capacity: integer("capacity").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("working_hours_day_idx").on(table.day),
    index("working_hours_active_order_idx").on(table.isActive, table.displayOrder),
  ],
);

/** Social network links shown in the contact/footer sections. */
export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("social_links_active_order_idx").on(table.isActive, table.displayOrder)],
);

/** Localized label for a social link (e.g. "روبیکا" / "Rubika"). */
export const socialLinksI18n = pgTable(
  "social_links_i18n",
  {
    socialLinkId: uuid("social_link_id")
      .notNull()
      .references(() => socialLinks.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    label: text("label").notNull(),
  },
  (table) => [primaryKey({ columns: [table.socialLinkId, table.locale] })],
);

export const socialLinksRelations = relations(socialLinks, ({ many }) => ({
  i18n: many(socialLinksI18n),
}));

export const socialLinksI18nRelations = relations(socialLinksI18n, ({ one }) => ({
  socialLink: one(socialLinks, {
    fields: [socialLinksI18n.socialLinkId],
    references: [socialLinks.id],
  }),
}));

export type WorkingHoursRow = typeof workingHours.$inferSelect;
export type NewWorkingHours = typeof workingHours.$inferInsert;