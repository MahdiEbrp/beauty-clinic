import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "paid",
  "cancelled",
]);

export const calendarTypeSchema = z.enum(["gregorian", "jalali"]);

/** A single date (Gregorian YYYY-MM-DD) or Jalali range resolved client-side. */
export const slotDateSchema = z
  .string()
  .trim()
  .regex(DATE_PATTERN, "Date must be YYYY-MM-DD");

export const createSlotSchema = z
  .object({
    serviceId: z.uuid().nullable().optional(),
    slotDate: slotDateSchema,
    startTime: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    endTime: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    capacity: z.number().int().min(1).max(500).default(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
  });

export const createSlotsSchema = z
  .object({
    slots: z.array(createSlotSchema).min(1).max(100),
  })
  .strict();

export const updateSlotSchema = z
  .object({
    slotDate: slotDateSchema.optional(),
    startTime: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    endTime: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    capacity: z.number().int().min(1).max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const listSlotsQuerySchema = z
  .object({
    from: slotDateSchema.optional(),
    to: slotDateSchema.optional(),
    serviceId: z.uuid().optional(),
  })
  .strict();

export const availableSlotsQuerySchema = z
  .object({
    date: slotDateSchema,
    serviceId: z.uuid().optional(),
  })
  .strict();

export const createBookingSchema = z
  .object({
    fullName: z.string().trim().min(2).max(160),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9\s()-]{6,19}$/, "Enter a valid phone number")
      .max(24),
    email: z.email().trim().max(254).optional().nullable(),
    serviceId: z.uuid(),
    slotId: z.uuid(),
    locale: z.enum(["fa", "en"]).default("fa"),
    notes: z.string().trim().max(1000).optional().nullable(),
  })
  .strict();

export const bookingStatusUpdateSchema = z
  .object({
    status: bookingStatusSchema,
  })
  .strict();

export const listBookingsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", ...bookingStatusSchema.options]).default("all"),
    slotId: z.uuid().optional(),
  })
  .strict();

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type CreateSlotsInput = z.infer<typeof createSlotsSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;
export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
