import { z } from "zod";
import { phoneSchema } from "./user";

export const otpChannelSchema = z.enum(["sms", "email"]);

export const requestOtpSchema = z
  .object({
    phone: phoneSchema,
    channel: otpChannelSchema,
  })
  .strict();

export const resendOtpSchema = z
  .object({
    phone: phoneSchema,
    channel: otpChannelSchema,
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    phone: phoneSchema,
    code: z.string().trim().regex(/^\d{6}$/, "a 6-digit code"),
  })
  .strict();

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type OtpChannel = RequestOtpInput["channel"];
