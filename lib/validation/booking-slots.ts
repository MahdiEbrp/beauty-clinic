import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const calendarTypeSchema = z.enum(["gregorian", "jalali"]);

/** A single date (Gregorian YYYY-MM-DD) or Jalali range resolved client-side. */
export const slotDateSchema = z
  .string()
  .trim()
  .regex(DATE_PATTERN, "Date must be YYYY-MM-DD");

/**
 * `groupIds` links a slot to specific service groups (one slot → many groups).
 * An empty array or omitted field means the slot is bookable for ALL groups.
 */
export const createSlotSchema = z
  .object({
    groupIds: z.array(z.uuid()).max(50).optional(),
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

const WEEKDAY_NAMES = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

/**
 * Bulk slot generation: date range + weekdays + time window + interval.
 * Generates one slot per start time for every matching date in the range.
 */
export const bulkGenerateSlotsSchema = z
  .object({
    fromDate: slotDateSchema,
    toDate: slotDateSchema,
    /** Weekday names whose dates get slots (empty = every day in range). */
    daysOfWeek: z.array(z.enum(WEEKDAY_NAMES)).min(1).max(7),
    opens: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    closes: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    intervalMin: z.number().int().min(5).max(1440).default(30),
    durationMin: z.number().int().min(5).max(1440).default(30),
    capacity: z.number().int().min(1).max(500).default(1),
    /** Empty = slot accepts every service group. */
    groupIds: z.array(z.uuid()).max(50).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.toDate < data.fromDate) {
      ctx.addIssue({
        code: "custom",
        path: ["toDate"],
        message: "End date must be after start date.",
      });
    }
    if (data.closes <= data.opens) {
      ctx.addIssue({
        code: "custom",
        path: ["closes"],
        message: "Closing time must be after opening time.",
      });
    }
    if (data.intervalMin < data.durationMin) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalMin"],
        message: "Interval must be at least the slot duration.",
      });
    }
  });

export type BulkGenerateSlotsInput = z.infer<typeof bulkGenerateSlotsSchema>;

export const updateSlotSchema = z
  .object({
    groupIds: z.array(z.uuid()).max(50).optional(),
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
    groupId: z.uuid().optional(),
  })
  .strict();

export const availableSlotsQuerySchema = z
  .object({
    date: slotDateSchema,
    groupId: z.uuid().optional(),
  })
  .strict();

/** Shared appointment picker: a slot must accept every selected service group
 * and have enough remaining seats for the whole multi-service order. */
export const sharedAvailableSlotsQuerySchema = z
  .object({
    date: slotDateSchema,
    groupIds: z
      .string()
      .trim()
      .min(1)
      .transform((value) => [...new Set(value.split(",").map((id) => id.trim()).filter(Boolean))])
      .pipe(z.array(z.uuid()).min(1).max(10)),
    quantity: z.coerce.number().int().min(1).max(100).default(1),
  })
  .strict();

/** Range query for the public booking calendar's days with free capacity. */
export const availableSlotDatesQuerySchema = z
  .object({
    from: slotDateSchema,
    to: slotDateSchema,
    groupId: z.uuid().optional(),
    groupIds: z
      .string()
      .trim()
      .min(1)
      .transform((value) => [...new Set(value.split(",").map((id) => id.trim()).filter(Boolean))])
      .pipe(z.array(z.uuid()).min(1).max(10))
      .optional(),
    quantity: z.coerce.number().int().min(1).max(100).default(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.to < value.from) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "End date must be on or after start date.",
      });
      return;
    }
    const spanDays = Math.round(
      (Date.parse(`${value.to}T00:00:00Z`) - Date.parse(`${value.from}T00:00:00Z`)) /
        86_400_000,
    );
    if (spanDays > 90) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "Availability range cannot exceed 90 days.",
      });
    }
    if (value.groupId && value.groupIds) {
      ctx.addIssue({
        code: "custom",
        path: ["groupIds"],
        message: "Choose either one group or multiple groups.",
      });
    }
  });


/**
 * Paginated admin slot list (separate from the date-range calendar fetch).
 */
export const listSlotsAdminQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive", "expired"]).default("all"),
    groupId: z.uuid().optional(),
  })
  .strict();

export type ListSlotsAdminQuery = z.infer<typeof listSlotsAdminQuerySchema>;


/**
 * Bulk actions for the slots admin list.
 */
export const bulkSlotsSchema = z
  .object({
    action: z.enum(["activate", "deactivate", "delete", "groups"]),
    scope: z.enum(["page", "filtered"]),
    ids: z.array(z.uuid()).max(100).optional(),
    groupIds: z.array(z.uuid()).max(50).optional(),
    filters: listSlotsAdminQuerySchema.pick({ search: true, status: true }).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.scope === "page" && (!value.ids || value.ids.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["ids"], message: "Select at least one slot." });
    }
    if (value.action === "groups" && !value.groupIds) {
      ctx.addIssue({ code: "custom", path: ["groupIds"], message: "Group selection is required." });
    }
  });

export type BulkSlotsInput = z.infer<typeof bulkSlotsSchema>;


export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type CreateSlotsInput = z.infer<typeof createSlotsSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;
export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;
