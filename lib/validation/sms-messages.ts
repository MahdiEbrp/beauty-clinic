import { z } from "zod";

import { SMS_ERROR_MESSAGES, SMS_LIMITS } from "@/lib/sms/constants";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import { pageSchema, positivePageSize, senderSchema } from "./sms-shared";

const recipientsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(SMS_LIMITS.recipientMinLength)
      .max(SMS_LIMITS.recipientMaxLength),
  )
  .min(SMS_LIMITS.messageMinLength)
  .max(SMS_LIMITS.recipientCountMax);

export const sendSmsSchema = z
  .object({
    providerId: z.uuid().optional(),
    templateId: z.uuid().optional(),
    messageType: z.enum(["transactional", "marketing"]).default("transactional"),
    sender: senderSchema,
    recipients: recipientsSchema,
    message: z.string().trim().max(SMS_LIMITS.messageMaxLength).optional(),
    locale: z.enum(["fa", "en"]).default("fa"),
    variables: z
      .record(z.string(), z.string().max(SMS_LIMITS.variableValueMaxLength))
      .optional(),
    campaignName: z
      .string()
      .trim()
      .max(SMS_LIMITS.campaignNameMaxLength)
      .optional(),
    idempotencyKey: z
      .string()
      .trim()
      .min(SMS_LIMITS.idempotencyKeyMinLength)
      .max(SMS_LIMITS.idempotencyKeyMaxLength)
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.templateId && !value.message) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: SMS_ERROR_MESSAGES.messageOrTemplateRequired,
      });
    }
    if (value.message && value.message.length === SMS_LIMITS.emptyLength) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: SMS_ERROR_MESSAGES.messageEmpty,
      });
    }
    const invalid = value.recipients.filter((recipient) => !normalizeIranianPhone(recipient));
    if (invalid.length > SMS_LIMITS.emptyLength) {
      ctx.addIssue({
        code: "custom",
        path: ["recipients"],
        message: SMS_ERROR_MESSAGES.invalidRecipients,
      });
    }
  });

export const listSmsMessagesQuerySchema = z
  .object({
    page: pageSchema,
    perPage: positivePageSize
      .max(SMS_LIMITS.messageListPerPageMax)
      .default(SMS_LIMITS.messageListPerPageDefault),
    search: z
      .string()
      .trim()
      .max(SMS_LIMITS.messageListSearchMaxLength)
      .optional(),
    status: z
      .enum(["all", "queued", "sending", "sent", "delivered", "failed"])
      .default("all"),
    providerId: z.uuid().optional(),
  })
  .strict();

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type ListSmsMessagesQuery = z.infer<typeof listSmsMessagesQuerySchema>;
