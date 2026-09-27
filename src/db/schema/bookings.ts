import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { serviceGroups } from "./service-catalog";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "paid",
  "waiting",
  "done",
  "refunded",
]);

/**
 * A staff-managed block of availability (the supply side of booking).
 * A slot with no linked groups is bookable for every group; linked ones
 * restrict it to exactly those groups (see `bookingSlotGroups`).
 */
export const bookingSlots = pgTable(
  "booking_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slotDate: date("slot_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    capacity: integer("capacity").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("booking_slots_date_active_idx").on(table.slotDate, table.isActive),
    /**
     * One slot per (date, start_time) — the slot auto-generator relies on this
     * identity to stay idempotent, and it prevents parallel writers (cron vs.
     * manual creation) from ever double-inserting.
     */
    uniqueIndex("booking_slots_date_start_idx").on(table.slotDate, table.startTime),
  ],
);

/**
 * Slot ↔ service-group availability (one slot → many groups). An empty set
 * means the slot accepts every group; any rows restrict it to those groups.
 */
export const bookingSlotGroups = pgTable(
  "booking_slot_groups",
  {
    slotId: uuid("slot_id")
      .notNull()
      .references(() => bookingSlots.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => serviceGroups.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.slotId, table.groupId] }),
    index("booking_slot_groups_group_idx").on(table.groupId),
  ],
);

/**
 * A public reservation tied to a slot and a service group (face filler, body
 * filler, …). Multiple group lines share one `groupRef` (see
 * `lib/bookings/service.ts`). Service prices are never stored or shown — only
 * the single fixed deposit from settings is charged (see `booking-checkout`).
 */
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    groupId: uuid("group_id").references(() => serviceGroups.id, {
      onDelete: "set null",
    }),
    /** Snapshot of the group name at booking time (never a price). */
    groupTitle: text("group_title").notNull().default(""),
    /** Multi-group orders share one `groupRef`; each row is one group+slot line. */
    groupRef: text("group_ref").notNull(),
    quantity: integer("quantity").notNull().default(1),
    currency: text("currency").notNull().default("تومان"),
    slotId: uuid("slot_id").references(() => bookingSlots.id, {
      onDelete: "set null",
    }),
    slotStart: timestamp("slot_start", { withTimezone: true }),
    slotEnd: timestamp("slot_end", { withTimezone: true }),
    /** The customer user this order belongs to (auto-provisioned by phone). */
    customerId: uuid("customer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** The one fixed deposit for the whole order (never a per-service sum). */
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentReference: text("payment_reference"),
    notes: text("notes"),
    consultationRequired: boolean("consultation_required").notNull().default(false),
    hasAllergies: boolean("has_allergies").notNull().default(false),
    isPregnant: boolean("is_pregnant").notNull().default(false),
    /** When the client accepted the clinic booking rules (null = not yet). */
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    /** When the pre-appointment reminder SMS was sent (null = not sent yet). */
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bookings_slot_id_idx").on(table.slotId),
    index("bookings_customer_id_idx").on(table.customerId),
    index("bookings_status_idx").on(table.status),
    index("bookings_group_id_idx").on(table.groupId),
    index("bookings_created_at_idx").on(table.createdAt),
    index("bookings_group_ref_idx").on(table.groupRef),
  ],
);

export const bookingSlotsRelations = relations(bookingSlots, ({ one, many }) => ({
  creator: one(users, { fields: [bookingSlots.createdBy], references: [users.id] }),
  groups: many(bookingSlotGroups),
  bookings: many(bookings),
}));

export const bookingSlotGroupsRelations = relations(bookingSlotGroups, ({ one }) => ({
  slot: one(bookingSlots, {
    fields: [bookingSlotGroups.slotId],
    references: [bookingSlots.id],
  }),
  group: one(serviceGroups, {
    fields: [bookingSlotGroups.groupId],
    references: [serviceGroups.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  group: one(serviceGroups, {
    fields: [bookings.groupId],
    references: [serviceGroups.id],
  }),
  slot: one(bookingSlots, {
    fields: [bookings.slotId],
    references: [bookingSlots.id],
  }),
  creator: one(users, { fields: [bookings.createdBy], references: [users.id] }),
}));

export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
export type BookingSlot = typeof bookingSlots.$inferSelect;
export type NewBookingSlot = typeof bookingSlots.$inferInsert;
export type BookingSlotGroup = typeof bookingSlotGroups.$inferSelect;
export type NewBookingSlotGroup = typeof bookingSlotGroups.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
