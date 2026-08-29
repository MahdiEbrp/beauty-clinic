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
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { services } from "./service-catalog";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "paid",
  "cancelled",
]);

/**
 * A staff-managed block of availability (the supply side of booking).
 * A slot with no linked services is bookable for every service; linked ones
 * restrict it to exactly those services (see `bookingSlotServices`).
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
  ],
);

/**
 * Slot ↔ service availability (one slot → many services). An empty set means
 * the slot accepts every service; any rows restrict it to those services.
 */
export const bookingSlotServices = pgTable(
  "booking_slot_services",
  {
    slotId: uuid("slot_id")
      .notNull()
      .references(() => bookingSlots.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.slotId, table.serviceId] }),
    index("booking_slot_services_service_idx").on(table.serviceId),
  ],
);

/** A public reservation tied to a slot. */
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    serviceTitle: text("service_title").notNull(),
    servicePrice: numeric("service_price", { precision: 12, scale: 2 }),
    /**
     * Multi-service orders share one `groupRef`; each row is one service +
     * slot line inside the group (see `lib/bookings/service.ts`).
     */
    groupRef: text("group_ref").notNull(),
    quantity: integer("quantity").notNull().default(1),
    currency: text("currency").notNull().default("تومان"),
    durationMin: integer("duration_min"),
    sessionsCount: integer("sessions_count").notNull().default(1),
    slotId: uuid("slot_id").references(() => bookingSlots.id, {
      onDelete: "set null",
    }),
    slotStart: timestamp("slot_start", { withTimezone: true }),
    slotEnd: timestamp("slot_end", { withTimezone: true }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentReference: text("payment_reference"),
    notes: text("notes"),
    consultationRequired: boolean("consultation_required").notNull().default(false),
    hasAllergies: boolean("has_allergies").notNull().default(false),
    isPregnant: boolean("is_pregnant").notNull().default(false),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bookings_slot_id_idx").on(table.slotId),
    index("bookings_status_idx").on(table.status),
    index("bookings_service_id_idx").on(table.serviceId),
    index("bookings_created_at_idx").on(table.createdAt),
    index("bookings_group_ref_idx").on(table.groupRef),
  ],
);

export const bookingSlotsRelations = relations(bookingSlots, ({ one, many }) => ({
  creator: one(users, { fields: [bookingSlots.createdBy], references: [users.id] }),
  services: many(bookingSlotServices),
  bookings: many(bookings),
}));

export const bookingSlotServicesRelations = relations(bookingSlotServices, ({ one }) => ({
  slot: one(bookingSlots, {
    fields: [bookingSlotServices.slotId],
    references: [bookingSlots.id],
  }),
  service: one(services, {
    fields: [bookingSlotServices.serviceId],
    references: [services.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
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
export type BookingSlotService = typeof bookingSlotServices.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
