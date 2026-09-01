import { z } from "zod";

import { EMAIL_LIMITS } from "@/lib/email/constants";
import { EMAIL_PROVIDER_OPTIONS } from "@/data/email-providers";

export const providerKinds = EMAIL_PROVIDER_OPTIONS.map(
  (option) => option.kind,
) as [
  (typeof EMAIL_PROVIDER_OPTIONS)[number]["kind"],
  ...(typeof EMAIL_PROVIDER_OPTIONS)[number]["kind"][],
];

export const hostSchema = z
  .string()
  .trim()
  .min(EMAIL_LIMITS.messageMinLength)
  .max(EMAIL_LIMITS.providerHostMaxLength);

export const portSchema = z.coerce
  .number()
  .int()
  .min(EMAIL_LIMITS.providerPortMin)
  .max(EMAIL_LIMITS.providerPortMax);

export const encryptionSchema = z
  .enum(["ssl", "starttls", "none"])
  .default("ssl");

export const usernameSchema = z
  .string()
  .trim()
  .min(EMAIL_LIMITS.messageMinLength)
  .max(EMAIL_LIMITS.providerUsernameMaxLength);

export const passwordSchema = z
  .string()
  .trim()
  .min(EMAIL_LIMITS.passwordMinLength)
  .max(EMAIL_LIMITS.providerPasswordMaxLength);

export const fromEmailSchema = z
  .string()
  .trim()
  .max(EMAIL_LIMITS.providerFromEmailMaxLength)
  .optional();

export const fromNameSchema = z
  .string()
  .trim()
  .max(EMAIL_LIMITS.providerFromNameMaxLength)
  .optional();

export const providerName = z
  .string()
  .trim()
  .min(EMAIL_LIMITS.providerNameMinLength)
  .max(EMAIL_LIMITS.providerNameMaxLength);

export const pageSchema = z.coerce
  .number()
  .int()
  .min(EMAIL_LIMITS.pageMin)
  .max(EMAIL_LIMITS.providerListPageMax)
  .default(EMAIL_LIMITS.pageDefault);

export const positivePageSize = z.coerce
  .number()
  .int()
  .min(EMAIL_LIMITS.pageMin);

