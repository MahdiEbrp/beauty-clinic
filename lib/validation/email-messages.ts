import { z } from "zod";

import { EMAIL_ERROR_MESSAGES, EMAIL_LIMITS } from "@/lib/email/constants";
import { normalizeEmail } from "@/lib/email/email";
import { fromEmailSchema, pageSchema, positivePageSize } from "./email-shared";

const recipientsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(EMAIL_LIMITS.recipientMinLength)
      .max(EMAIL_LIMITS.recipientMaxLength),
  )
  .min(EMAIL_LIMITS.messageMinLength)
  .max(EMAIL_LIMITS.recipientCountMax);

export const sendEmailSchema = z
  .object({
    providerId: z.uuid().optional(),
    templateId: z.uuid().optional(),
    messageType: z.enum(["transactional", "marketing"]).default("transactional"),
    contentFormat: z.enum(["plain", "html"]).default("html"),
    fromEmail: fromEmailSchema,
    recipients: recipientsSchema,
    subject: z.string().trim().max(EMAIL_LIMITS.subjectMaxLength).optional(),
    message: z.string().trim().max(EMAIL_LIMITS.messageMaxLength).optional(),
    locale: z.enum(["fa", "en"]).default("fa"),
    variables: z
      .record(z.string(), z.string().max(EMAIL_LIMITS.variableValueMaxLength))
      .optional(),
    campaignName: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.campaignNameMaxLength)
      .optional(),
    idempotencyKey: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.idempotencyKeyMinLength)
      .max(EMAIL_LIMITS.idempotencyKeyMaxLength)
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.templateId && !value.message) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: EMAIL_ERROR_MESSAGES.messageOrTemplateRequired,
      });
    }
    if (value.message && value.message.length === EMAIL_LIMITS.emptyLength) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: EMAIL_ERROR_MESSAGES.messageEmpty,
      });
    }
    if (!value.templateId && (!value.subject || value.subject.length === EMAIL_LIMITS.emptyLength)) {
      ctx.addIssue({
        code: "custom",
        path: ["subject"],
        message: EMAIL_ERROR_MESSAGES.messageOrTemplateRequired,
      });
    }
    const invalid = value.recipients.filter((recipient) => !normalizeEmail(recipient));
    if (invalid.length > EMAIL_LIMITS.emptyLength) {
      ctx.addIssue({
        code: "custom",
        path: ["recipients"],
        message: EMAIL_ERROR_MESSAGES.invalidRecipients,
      });
    }
  });

export const listEmailMessagesQuerySchema = z
  .object({
    page: pageSchema,
    perPage: positivePageSize
      .max(EMAIL_LIMITS.messageListPerPageMax)
      .default(EMAIL_LIMITS.messageListPerPageDefault),
    search: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.messageListSearchMaxLength)
      .optional(),
    status: z
      .enum(["all", "queued", "sending", "sent", "delivered", "failed"])
      .default("all"),
    providerId: z.uuid().optional(),
  })
  .strict();

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type ListEmailMessagesQuery = z.infer<typeof listEmailMessagesQuerySchema>;

export const listEmailRecipientsQuerySchema = z
  .object({
    page: pageSchema,
    perPage: positivePageSize
      .max(EMAIL_LIMITS.recipientListPerPageMax)
      .default(EMAIL_LIMITS.recipientListPerPageDefault),
    search: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.recipientSearchMaxLength)
      .optional(),
  })
  .strict();

export type ListEmailRecipientsQuery = z.infer<typeof listEmailRecipientsQuerySchema>;