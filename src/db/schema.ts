/* eslint-disable max-lines -- complete database schema with all tables, relations, and enums */

import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  inet,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").notNull().default(true),
    isBanned: boolean("is_banned").notNull().default(false),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    banReason: text("ban_reason"),
    bannedBy: uuid("banned_by").references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    twoFactorSecret: text("two_factor_secret"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_lower_idx")
      .on(sql`lower(${table.email})`)
      .where(sql`${table.deletedAt} IS NULL`),
    uniqueIndex("users_phone_idx")
      .on(table.phone)
      .where(sql`${table.deletedAt} IS NULL AND ${table.phone} IS NOT NULL`),
    index("users_deleted_at_idx").on(table.deletedAt),
    index("users_is_banned_idx").on(table.isBanned),
    index("users_last_login_at_idx").on(table.lastLoginAt),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("roles_key_idx").on(table.key)],
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("permissions_key_idx").on(table.key)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ip: inet("ip"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  sessions: many(sessions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const settings = pgTable(
  "settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scope: text("scope").notNull().default("user"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    type: text("type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("settings_user_key_idx")
      .on(table.userId, table.key)
      .where(sql`${table.scope} = 'user'`),
    uniqueIndex("settings_system_key_idx")
      .on(table.key)
      .where(sql`${table.scope} = 'system'`),
    index("settings_user_id_idx").on(table.userId),
  ],
);

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, { fields: [settings.userId], references: [users.id] }),
}));

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type StorageNode = typeof storageNodes.$inferSelect;
export type NewStorageNode = typeof storageNodes.$inferInsert;

// ---------------------------------------------------------------------------
// Service catalog
//
// Three levels: serviceGroups (top level, e.g. "Laser") → serviceCategories
// (sub-groups that always belong to a group) → services (actual billable
// treatments). Translation keys are stored in name/title/description columns
// (e.g. `servicesList.facial.title`) and rendered via next-intl `t()`.
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
    price: numeric("price", { precision: 10, scale: 2 }),
    priceType: priceTypeEnum("price_type").notNull().default("fixed"),
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
  category: one(serviceCategories, { fields: [serviceCategoriesI18n.categoryId], references: [serviceCategories.id] }),
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
