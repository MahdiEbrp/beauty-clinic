import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { localeEnum, services } from "./service-catalog";

export const landingPages = pgTable(
  "landing_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("landing_pages_slug_idx").on(table.slug)],
);

export const landingPagesI18n = pgTable(
  "landing_pages_i18n",
  {
    landingPageId: uuid("landing_page_id")
      .notNull()
      .references(() => landingPages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [primaryKey({ columns: [table.landingPageId, table.locale] })],
);

export const landingSections = pgTable(
  "landing_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landingPageId: uuid("landing_page_id")
      .notNull()
      .references(() => landingPages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    key: text("key").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landing_sections_page_key_idx").on(table.landingPageId, table.key),
    index("landing_sections_page_active_idx").on(table.landingPageId, table.isActive),
  ],
);

export const landingSectionsI18n = pgTable(
  "landing_sections_i18n",
  {
    sectionId: uuid("section_id")
      .notNull()
      .references(() => landingSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    heading: text("heading").notNull(),
    description: text("description"),
  },
  (table) => [primaryKey({ columns: [table.sectionId, table.locale] })],
);

export const landingHero = pgTable(
  "landing_hero",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landingPageId: uuid("landing_page_id")
      .notNull()
      .references(() => landingPages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    image: text("image"),
    taglineIcon: text("tagline_icon"),
  },
  (table) => [uniqueIndex("landing_hero_page_idx").on(table.landingPageId)],
);

export const landingHeroI18n = pgTable(
  "landing_hero_i18n",
  {
    heroId: uuid("hero_id")
      .notNull()
      .references(() => landingHero.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    ctaLabel1: text("cta_label_1").notNull(),
    ctaLabel2: text("cta_label_2").notNull(),
  },
  (table) => [primaryKey({ columns: [table.heroId, table.locale] })],
);

export const landingMarqueeItems = pgTable(
  "landing_marquee_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landingPageId: uuid("landing_page_id")
      .notNull()
      .references(() => landingPages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    key: text("key").notNull(),
    icon: text("icon"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landing_marquee_items_page_key_idx").on(table.landingPageId, table.key),
    index("landing_marquee_items_page_active_idx").on(table.landingPageId, table.isActive),
  ],
);

export const landingMarqueeItemsI18n = pgTable(
  "landing_marquee_items_i18n",
  {
    marqueeItemId: uuid("marquee_item_id")
      .notNull()
      .references(() => landingMarqueeItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    text: text("text").notNull(),
  },
  (table) => [primaryKey({ columns: [table.marqueeItemId, table.locale] })],
);

export const landingServices = pgTable(
  "landing_services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => landingSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    key: text("key").notNull(),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    icon: text("icon"),
    image: text("image"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landing_services_section_key_idx").on(table.sectionId, table.key),
    index("landing_services_section_active_idx").on(table.sectionId, table.isActive),
  ],
);

export const landingServicesI18n = pgTable(
  "landing_services_i18n",
  {
    landingServiceId: uuid("landing_service_id")
      .notNull()
      .references(() => landingServices.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull().default(""),
    description: text("description"),
    ctaLabel: text("cta_label"),
  },
  (table) => [primaryKey({ columns: [table.landingServiceId, table.locale] })],
);

export const landingAboutStats = pgTable(
  "landing_about_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => landingSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    key: text("key").notNull(),
    value: integer("value").notNull(),
    compact: boolean("compact").notNull().default(false),
    plus: boolean("plus").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landing_about_stats_section_key_idx").on(table.sectionId, table.key),
    index("landing_about_stats_section_active_idx").on(table.sectionId, table.isActive),
  ],
);

export const landingAboutStatsI18n = pgTable(
  "landing_about_stats_i18n",
  {
    statId: uuid("stat_id")
      .notNull()
      .references(() => landingAboutStats.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    label: text("label").notNull(),
  },
  (table) => [primaryKey({ columns: [table.statId, table.locale] })],
);

export const landingGalleryItems = pgTable(
  "landing_gallery_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => landingSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    key: text("key").notNull(),
    imageUrl: text("image_url").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landing_gallery_items_section_key_idx").on(table.sectionId, table.key),
    index("landing_gallery_items_section_active_idx").on(table.sectionId, table.isActive),
  ],
);

export const landingGalleryItemsI18n = pgTable(
  "landing_gallery_items_i18n",
  {
    galleryItemId: uuid("gallery_item_id")
      .notNull()
      .references(() => landingGalleryItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    caption: text("caption"),
    alt: text("alt").notNull(),
  },
  (table) => [primaryKey({ columns: [table.galleryItemId, table.locale] })],
);

// --- Types -----------------------------------------------------------------

export type LandingPage = typeof landingPages.$inferSelect;
export type NewLandingPage = typeof landingPages.$inferInsert;
export type LandingPageI18n = typeof landingPagesI18n.$inferSelect;
export type NewLandingPageI18n = typeof landingPagesI18n.$inferInsert;
export type LandingSection = typeof landingSections.$inferSelect;
export type NewLandingSection = typeof landingSections.$inferInsert;
export type LandingHero = typeof landingHero.$inferSelect;
export type NewLandingHero = typeof landingHero.$inferInsert;
export type LandingMarqueeItem = typeof landingMarqueeItems.$inferSelect;
export type NewLandingMarqueeItem = typeof landingMarqueeItems.$inferInsert;
export type LandingService = typeof landingServices.$inferSelect;
export type NewLandingService = typeof landingServices.$inferInsert;
export type LandingAboutStat = typeof landingAboutStats.$inferSelect;
export type NewLandingAboutStat = typeof landingAboutStats.$inferInsert;
export type LandingGalleryItem = typeof landingGalleryItems.$inferSelect;
export type NewLandingGalleryItem = typeof landingGalleryItems.$inferInsert;
