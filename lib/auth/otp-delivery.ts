import "server-only";

import { ApiError } from "@/lib/api/errors";
import { logError } from "@/lib/log";
import { getEmailProviderForUse } from "@/lib/email/provider-service";
import { createEmailProviderAdapter } from "@/lib/email/providers";
import { getSmsProviderForUse } from "@/lib/sms/provider-service";
import { createSmsProviderAdapter } from "@/lib/sms/providers";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import type { OtpChannel } from "@/src/db/schema";

export type OtpDeliveryInput = {
  channel: OtpChannel;
  /** Stored user phone (SMS recipient). */
  phone: string;
  /** Stored user email (email recipient). */
  email: string;
  code: string;
  /** Localized, code already interpolated. */
  smsText: string;
  emailSubject: string;
  emailHtml: string;
};

/**
 * Sends the login code through the active provider of the chosen channel.
 * Delivery problems are normalized to a single `OTP_PROVIDER_UNAVAILABLE`
 * ApiError so callers (and clients) treat every provider failure alike.
 */
export async function sendLoginOtp(input: OtpDeliveryInput): Promise<void> {
  if (input.channel === "sms") {
    await sendSms(input);
  } else {
    await sendEmail(input);
  }
}

async function sendSms(input: OtpDeliveryInput): Promise<void> {
  try {
    const provider = await getSmsProviderForUse();
    const adapter = createSmsProviderAdapter(provider);
    const recipients = [normalizeIranianPhone(input.phone) ?? input.phone];
    const result = await adapter.send({
      recipients,
      message: input.smsText,
      sender: provider.sender ?? provider.credentials.lineNumber,
    });
    if (result.accepted.length === 0) {
      logError("otp.delivery_rejected", { channel: "sms" });
      throw new ApiError(
        502,
        "OTP_PROVIDER_UNAVAILABLE",
        "The verification code could not be sent.",
      );
    }
  } catch (error) {
    throw normalizeDeliveryError("sms", error);
  }
}

async function sendEmail(input: OtpDeliveryInput): Promise<void> {
  try {
    const provider = await getEmailProviderForUse();
    const adapter = createEmailProviderAdapter({
      kind: provider.kind,
      host: provider.host,
      port: provider.port,
      username: provider.username,
      password: provider.password,
      encryption: provider.encryption,
      fromEmail: provider.fromEmail,
      fromName: provider.fromName,
    });
    const result = await adapter.send({
      recipients: [input.email],
      subject: input.emailSubject,
      message: input.emailHtml,
      templateType: "html",
      fromEmail: provider.fromEmail ?? undefined,
    });
    if (result.accepted.length === 0) {
      logError("otp.delivery_rejected", { channel: "email" });
      throw new ApiError(
        502,
        "OTP_PROVIDER_UNAVAILABLE",
        "The verification code could not be sent.",
      );
    }
  } catch (error) {
    throw normalizeDeliveryError("email", error);
  }
}

function normalizeDeliveryError(channel: OtpChannel, error: unknown): unknown {
  if (
    error instanceof ApiError &&
    (error.code === "SMS_PROVIDER_NOT_CONFIGURED" ||
      error.code === "SMS_PROVIDER_INACTIVE" ||
      error.code === "EMAIL_PROVIDER_NOT_CONFIGURED" ||
      error.code === "EMAIL_PROVIDER_INACTIVE" ||
      error.code === "OTP_PROVIDER_UNAVAILABLE")
  ) {
    return new ApiError(
      502,
      "OTP_PROVIDER_UNAVAILABLE",
      "The verification code could not be sent.",
    );
  }
  logError("otp.delivery_failed", {
    channel,
    error: error instanceof Error ? error.message : String(error),
  });
  return new ApiError(
    502,
    "OTP_PROVIDER_UNAVAILABLE",
    "The verification code could not be sent.",
  );
}
