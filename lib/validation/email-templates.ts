import { z } from "zod";

import { EMAIL_LIMITS } from "@/lib/email/constants";
import { pageSchema, positivePageSize } from "./email-shared";

const variableSchema = z
  .string()
  .trim()
  .min(EMAIL_LIMITS.messageMinLength)
  .max(EMAIL_LIMITS.templateVariableMaxLength)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

const templateTranslationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.messageMinLength)
      .max(EMAIL_LIMITS.templateNameMaxLength),
    subject: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.subjectMinLength)
      .max(EMAIL_LIMITS.subjectMaxLength),
    content: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.messageMinLength)
      .max(EMAIL_LIMITS.messageMaxLength),
  })
  .strict();

const templateTranslationsSchema = z
  .object({
    fa: templateTranslationSchema,
    en: templateTranslationSchema,
  })
  .strict();

export const listEmailTemplatesQuerySchema = z
  .object({
    page: pageSchema,
    perPage: positivePageSize
      .max(EMAIL_LIMITS.templateListPerPageMax)
      .default(EMAIL_LIMITS.templateListPerPageDefault),
    search: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.templateSearchMaxLength)
      .optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

const templateFields = {
  key: z
    .string()
    .trim()
    .min(EMAIL_LIMITS.templateKeyMinLength)
    .max(EMAIL_LIMITS.templateKeyMaxLength)
    .regex(/^[a-z][a-z0-9_.-]*$/),
  externalTemplateId: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .max(64)
    .optional(),
  messageType: z.enum(["transactional", "marketing"]).default("transactional"),
  contentFormat: z.enum(["plain", "html"]).default("html"),
  variables: z
    .array(variableSchema)
    .max(EMAIL_LIMITS.templateVariableCountMax)
    .default([]),
  translations: templateTranslationsSchema,
  displayOrder: z
    .number()
    .int()
    .min(EMAIL_LIMITS.templateDisplayOrderMin)
    .max(EMAIL_LIMITS.templateDisplayOrderMax)
    .default(EMAIL_LIMITS.zero),
  isActive: z.boolean().default(true),
};

function rejectDuplicateVariables(
  value: { variables?: string[] },
  ctx: z.RefinementCtx,
) {
  if (value.variables && new Set(value.variables).size !== value.variables.length) {
    ctx.addIssue({
      code: "custom",
      path: ["variables"],
      message: "Template variables must be unique.",
    });
  }
}

export const createEmailTemplateSchema = z
  .object(templateFields)
  .strict()
  .superRefine((value, ctx) => {
    rejectDuplicateVariables(value, ctx);
  });

export const updateEmailTemplateSchema = z
  .object(templateFields)
  .omit({ key: true })
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    rejectDuplicateVariables(value, ctx);
  });

export type ListEmailTemplatesQuery = z.infer<typeof listEmailTemplatesQuerySchema>;
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;