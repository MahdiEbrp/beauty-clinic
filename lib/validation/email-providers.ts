import { z } from "zod";

import { EMAIL_ERROR_MESSAGES, EMAIL_LIMITS } from "@/lib/email/constants";
import { normalizeEmail } from "@/lib/email/email";
import {
  encryptionSchema,
  fromEmailSchema,
  fromNameSchema,
  hostSchema,
  pageSchema,
  passwordSchema,
  positivePageSize,
  portSchema,
  providerKinds,
  providerName,
  usernameSchema,
} from "./email-shared";

export const listEmailProvidersQuerySchema = z
  .object({
    page: pageSchema,
    perPage: positivePageSize
      .max(EMAIL_LIMITS.providerListPerPageMax)
      .default(EMAIL_LIMITS.providerListPerPageDefault),
    search: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.providerSearchMaxLength)
      .optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export const createEmailProviderSchema = z
  .object({
    name: providerName,
    kind: z.enum(providerKinds),
    host: hostSchema,
    port: portSchema,
    username: usernameSchema,
    password: passwordSchema,
    encryption: encryptionSchema,
    fromEmail: fromEmailSchema,
    fromName: fromNameSchema,
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  })
  .strict();

export const updateEmailProviderSchema = z
  .object({
    name: providerName.optional(),
    kind: z.enum(providerKinds).optional(),
    host: hostSchema.optional(),
    port: portSchema.optional(),
    username: usernameSchema.optional(),
    password: z
      .string()
      .trim()
      .max(EMAIL_LIMITS.providerPasswordMaxLength)
      .optional(),
    encryption: encryptionSchema.optional(),
    fromEmail: fromEmailSchema,
    fromName: fromNameSchema,
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.password === undefined ||
      value.password.length > EMAIL_LIMITS.emptyLength,
    EMAIL_ERROR_MESSAGES.passwordEmpty,
  );

export const testEmailProviderSchema = z
  .object({
    recipient: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.recipientMinLength)
      .max(EMAIL_LIMITS.recipientMaxLength),
    subject: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.subjectMinLength)
      .max(EMAIL_LIMITS.subjectMaxLength),
    message: z
      .string()
      .trim()
      .min(EMAIL_LIMITS.messageMinLength)
      .max(EMAIL_LIMITS.messageMaxLength),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!normalizeEmail(value.recipient)) {
      ctx.addIssue({
        code: "custom",
        path: ["recipient"],
        message: EMAIL_ERROR_MESSAGES.invalidEmailAddress,
      });
    }
  });

export type ListEmailProvidersQuery = z.infer<typeof listEmailProvidersQuerySchema>;
export type CreateEmailProviderInput = z.infer<typeof createEmailProviderSchema>;
export type UpdateEmailProviderInput = z.infer<typeof updateEmailProviderSchema>;
export type TestEmailProviderInput = z.infer<typeof testEmailProviderSchema>;