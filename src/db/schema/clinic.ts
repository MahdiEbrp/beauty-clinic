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

import { localeEnum, serviceGroups } from "./service-catalog";

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

/**
 * Optional per-weekday slot pattern: explicit (start_time → capacity) rows that
 * override interval-based generation for a weekday. A weekday with at least one
 * row here is generated exactly from these times; weekdays without rows fall
 * back to the working-hours window + global interval/duration/capacity.
 */
export const slotPatterns = pgTable(
  "slot_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    day: text("day").notNull(),
    startTime: time("start_time").notNull(),
    capacity: integer("capacity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("slot_patterns_day_idx").on(table.day),
    uniqueIndex("slot_patterns_day_start_idx").on(table.day, table.startTime),
  ],
);

/**
 * Slot pattern ↔ service-group availability (one pattern row → many groups).
 * An empty set means the generated slot accepts every group; any rows restrict
 * it to exactly those groups (mirrors `bookingSlotGroups`).
 */
export const slotPatternGroups = pgTable(
  "slot_pattern_groups",
  {
    patternId: uuid("pattern_id")
      .notNull()
      .references(() => slotPatterns.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => serviceGroups.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.patternId, table.groupId] }),
    index("slot_pattern_groups_group_idx").on(table.groupId),
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

export const slotPatternsRelations = relations(slotPatterns, ({ many }) => ({
  groups: many(slotPatternGroups),
}));

export const slotPatternGroupsRelations = relations(slotPatternGroups, ({ one }) => ({
  pattern: one(slotPatterns, {
    fields: [slotPatternGroups.patternId],
    references: [slotPatterns.id],
  }),
  group: one(serviceGroups, {
    fields: [slotPatternGroups.groupId],
    references: [serviceGroups.id],
  }),
}));

export type WorkingHoursRow = typeof workingHours.$inferSelect;
export type NewWorkingHours = typeof workingHours.$inferInsert;
export type SlotPatternRow = typeof slotPatterns.$inferSelect;
export type NewSlotPattern = typeof slotPatterns.$inferInsert;
export type SlotPatternGroup = typeof slotPatternGroups.$inferSelect;
export type NewSlotPatternGroup = typeof slotPatternGroups.$inferInsert;