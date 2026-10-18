import type { OtpChannel } from "@/src/db/schema";

export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const SMS_OTP_TTL_MS = 2 * 60 * 1000;
const SMS_OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000;

/** SMS keeps codes/limits longer than email (5 minutes). */
export function otpTtlMs(channel: OtpChannel): number {
  return channel === "sms" ? SMS_OTP_TTL_MS : OTP_TTL_MS;
}

export function otpResendCooldownMs(channel: OtpChannel): number {
  return channel === "sms" ? SMS_OTP_RESEND_COOLDOWN_MS : OTP_RESEND_COOLDOWN_MS;
}
