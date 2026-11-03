import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Service catalog
//
// Three levels: serviceGroups (top level, e.g. "Laser") → serviceCategories
// (sub-groups that always belong to a group) → services (actual billable
// services). Localized content is stored per locale in the *_i18n tables.
// ---------------------------------------------------------------------------

export const priceTypeEnum = pgEnum("price_type", ["fixed", "from", "on_request"]);

export const serviceImageTypeEnum = pgEnum("service_image_type", [
  "before",
  "after",
  "gallery",
]);

export const serviceGroups = pgTable(
  "service_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    icon: text("icon"),
    image: text("image"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("service_groups_slug_idx").on(table.slug),
    index("service_groups_is_active_idx").on(table.isActive),
  ],
);

export const serviceCategories = pgTable(
  "service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => serviceGroups.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    icon: text("icon"),
    image: text("image"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("service_categories_slug_idx").on(table.slug),
    index("service_categories_group_id_idx").on(table.groupId),
    index("service_categories_is_active_idx").on(table.isActive),
  ],
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }),
    priceType: priceTypeEnum("price_type").notNull().default("fixed"),
    unit: text("unit"),
    durationMin: integer("duration_min"),
    sessionsCount: integer("sessions_count").notNull().default(1),
    coverImage: text("cover_image"),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("services_slug_idx").on(table.slug),
    index("services_category_id_idx").on(table.categoryId),
    index("services_is_active_idx").on(table.isActive),
    index("services_is_featured_idx").on(table.isFeatured),
  ],
);

export const serviceImages = pgTable(
  "service_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    type: serviceImageTypeEnum("type").notNull().default("gallery"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("service_images_service_id_idx").on(table.serviceId)],
);

export const serviceFaqs = pgTable(
  "service_faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("service_faqs_service_id_idx").on(table.serviceId)],
);

export const localeEnum = pgEnum("locale", ["en", "fa"]);

export const serviceGroupsI18n = pgTable(
  "service_groups_i18n",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => serviceGroups.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.locale] })],
);

export const serviceCategoriesI18n = pgTable(
  "service_categories_i18n",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [primaryKey({ columns: [table.categoryId, table.locale] })],
);

export const servicesI18n = pgTable(
  "services_i18n",
  {
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    shortDesc: text("short_desc"),
    fullDesc: text("full_desc"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [primaryKey({ columns: [table.serviceId, table.locale] })],
);

export const serviceFaqsI18n = pgTable(
  "service_faqs_i18n",
  {
    faqId: uuid("faq_id")
      .notNull()
      .references(() => serviceFaqs.id, { onDelete: "cascade", onUpdate: "cascade" }),
    locale: localeEnum("locale").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
  },
  (table) => [primaryKey({ columns: [table.faqId, table.locale] })],
);

export const serviceGroupsRelations = relations(serviceGroups, ({ many }) => ({
  categories: many(serviceCategories),
  i18n: many(serviceGroupsI18n),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
  group: one(serviceGroups, {
    fields: [serviceCategories.groupId],
    references: [serviceGroups.id],
  }),
  services: many(services),
  i18n: many(serviceCategoriesI18n),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  images: many(serviceImages),
  faqs: many(serviceFaqs),
  i18n: many(servicesI18n),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, { fields: [serviceImages.serviceId], references: [services.id] }),
}));

export const serviceFaqsRelations = relations(serviceFaqs, ({ one, many }) => ({
  service: one(services, { fields: [serviceFaqs.serviceId], references: [services.id] }),
  i18n: many(serviceFaqsI18n),
}));

export const serviceGroupsI18nRelations = relations(serviceGroupsI18n, ({ one }) => ({
  group: one(serviceGroups, { fields: [serviceGroupsI18n.groupId], references: [serviceGroups.id] }),
}));

export const serviceCategoriesI18nRelations = relations(serviceCategoriesI18n, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [serviceCategoriesI18n.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const servicesI18nRelations = relations(servicesI18n, ({ one }) => ({
  service: one(services, { fields: [servicesI18n.serviceId], references: [services.id] }),
}));

export const serviceFaqsI18nRelations = relations(serviceFaqsI18n, ({ one }) => ({
  faq: one(serviceFaqs, { fields: [serviceFaqsI18n.faqId], references: [serviceFaqs.id] }),
}));

export type ServiceGroup = typeof serviceGroups.$inferSelect;
export type NewServiceGroup = typeof serviceGroups.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type ServiceFaq = typeof serviceFaqs.$inferSelect;
export type ServiceGroupI18n = typeof serviceGroupsI18n.$inferSelect;
export type NewServiceGroupI18n = typeof serviceGroupsI18n.$inferInsert;
export type ServiceCategoryI18n = typeof serviceCategoriesI18n.$inferSelect;
export type NewServiceCategoryI18n = typeof serviceCategoriesI18n.$inferInsert;
export type ServiceI18n = typeof servicesI18n.$inferSelect;
export type NewServiceI18n = typeof servicesI18n.$inferInsert;
export type ServiceFaqI18n = typeof serviceFaqsI18n.$inferSelect;
export type NewServiceFaqI18n = typeof serviceFaqsI18n.$inferInsert;
