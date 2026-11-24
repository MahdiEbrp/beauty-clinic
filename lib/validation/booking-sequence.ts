import { z } from "zod";
import { availableSlotDatesQuerySchema, slotDateSchema } from "./booking-slots";

const requests = z.array(z.object({
  groupId: z.uuid(), quantity: z.number().int().min(1).max(10),
}).strict()).min(1).max(10);

/** A bounded, ordered JSON query parameter; order matters for group eligibility. */
export const serviceSlotRequestsSchema = z.preprocess((value) => {
  if (typeof value !== "string" || value.length > 4096) return value;
  try { return JSON.parse(value) as unknown; } catch { return undefined; }
}, requests);

export const consecutiveSlotsQuerySchema = z.object({
  date: slotDateSchema,
  items: serviceSlotRequestsSchema,
}).strict();

export const consecutiveDatesQuerySchema = z.object({
  from: slotDateSchema,
  to: slotDateSchema,
  items: serviceSlotRequestsSchema,
}).strict().superRefine((value, ctx) => {
  const range = availableSlotDatesQuerySchema.safeParse({ from: value.from, to: value.to });
  if (!range.success) {
    for (const issue of range.error.issues) ctx.addIssue({ code: "custom", path: issue.path, message: issue.message });
  }
});
