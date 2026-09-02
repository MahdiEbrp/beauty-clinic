import { z } from "zod";
import { emailSchema, phoneSchema } from "./user";

export const otpChannelSchema = z.enum(["sms", "email"]);

/**
 * The OTP login identifier is channel-dependent: SMS logs in with a phone
 * number, Email with an email address. The code is always delivered to that
 * same identifier.
 */
export const requestOtpSchema = z.discriminatedUnion("channel", [
  z.object({ channel: z.literal("sms"), phone: phoneSchema }).strict(),
  z.object({ channel: z.literal("email"), email: emailSchema }).strict(),
]);

export const resendOtpSchema = requestOtpSchema;

export const verifyOtpSchema = z
  .object({
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    code: z.string().trim().regex(/^\d{6}$/, "a 6-digit code"),
  })
  .strict()
  .refine(
    (value) => (value.phone !== undefined) !== (value.email !== undefined),
    { message: "Exactly one of phone or email is required." },
  );

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type OtpChannel = RequestOtpInput["channel"];
