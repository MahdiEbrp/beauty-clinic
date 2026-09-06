import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** English weekday names — the same set stored in the `working_hours` table. */
export const workingHoursDaySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const createWorkingHourSchema = z
  .object({
    day: workingHoursDaySchema,
    opens: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    closes: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    capacity: z.number().int().min(1).max(500).default(1),
    displayOrder: z.number().int().min(0).max(1000).default(0),
    isActive: z.boolean().default(true),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.closes <= data.opens) {
      ctx.addIssue({
        code: "custom",
        path: ["closes"],
        message: "Closes must be after opens",
      });
    }
  });

export type CreateWorkingHourInput = z.infer<typeof createWorkingHourSchema>;

/** The day cannot move — it is the unique identity of a working-hours row. */
export const updateWorkingHourSchema = z
  .object({
    opens: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    closes: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    capacity: z.number().int().min(1).max(500).optional(),
    displayOrder: z.number().int().min(0).max(1000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.closes && data.opens && data.closes <= data.opens) {
      ctx.addIssue({
        code: "custom",
        path: ["closes"],
        message: "Closes must be after opens",
      });
    }
  });

export type UpdateWorkingHourInput = z.infer<typeof updateWorkingHourSchema>;

export const listWorkingHoursQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export type ListWorkingHoursQuery = z.infer<typeof listWorkingHoursQuerySchema>;

export const bulkWorkingHoursSchema = z
  .object({
    action: z.enum(["activate", "deactivate", "delete"]),
    scope: z.enum(["page", "filtered"]),
    ids: z.array(z.uuid()).max(100).optional(),
    filters: listWorkingHoursQuerySchema
      .pick({ search: true, status: true })
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.scope === "page" && (!value.ids || value.ids.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["ids"],
        message: "Select at least one working-hours row.",
      });
    }
  });

export type BulkWorkingHoursInput = z.infer<typeof bulkWorkingHoursSchema>;