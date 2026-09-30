import "server-only";

import { ApiError } from "@/lib/api/errors";
import { logError, logInfo } from "@/lib/log";
import { getEmailProviderForUse } from "@/lib/email/provider-service";
import { createEmailProviderAdapter } from "@/lib/email/providers";
import { getSmsProviderForUse } from "@/lib/sms/provider-service";
import { createSmsProviderAdapter } from "@/lib/sms/providers";
import { getSmsTemplateByKey } from "@/lib/sms/template-service";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import type { OtpChannel, SmsProviderKind } from "@/src/db/schema";

/** Active SMS template whose remote id backs the login OTP (SMS.ir verify). */
const SMS_OTP_TEMPLATE_KEY = "login-otp";

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
    const verify = await resolveOtpVerify(provider.kind, input.code);
    const result =
      verify && adapter.sendVerify
        ? await adapter.sendVerify({
            recipients,
            templateId: verify.templateId,
            parameters: verify.parameters,
          })
        : await adapter.send({
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

/**
 * SMS.ir renders OTP codes server-side from a pre-approved template, so the
 * login code goes through `sendVerify` instead of free text. The template's
 * variable name is the remote parameter name (e.g. `OTP`). Returns null for any
 * other provider, or when no usable template is registered, so callers fall
 * back to a free-text send.
 */
async function resolveOtpVerify(
  kind: SmsProviderKind,
  code: string,
): Promise<{ templateId: number; parameters: Array<{ name: string; value: string }> } | null> {
  if (kind !== "sms_ir") return null;
  const template = await getSmsTemplateByKey(SMS_OTP_TEMPLATE_KEY);
  const templateId = Number(template?.externalTemplateId);
  const name = template?.variables[0];
  if (!template?.externalTemplateId || !Number.isInteger(templateId) || !name) {
    return null;
  }
  return { templateId, parameters: [{ name, value: code }] };
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
    // Dev-only fake sender: with no active email provider (and never in
    // production) the code is only logged to the server console so OTP login
    // stays testable without an SMTP server.
    if (isUnconfiguredEmailError(error) && !isProduction()) {
      logInfo("otp.email.dev_log", {
        recipients: [input.email],
        subject: input.emailSubject,
        message: input.emailHtml,
      });
      return;
    }
    throw normalizeDeliveryError("email", error);
  }
}

function isUnconfiguredEmailError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === "EMAIL_PROVIDER_NOT_CONFIGURED" ||
      error.code === "EMAIL_PROVIDER_INACTIVE")
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
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
