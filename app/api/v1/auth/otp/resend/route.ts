import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { getApiTranslations } from "@/lib/i18n/api-translations";
import type { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/rate-limit";
import {
  getLoginUserByIdentifier,
  invalidateLatestLoginOtp,
  issueLoginOtp,
  resendLoginOtp,
  otpTtlMs,
  otpResendCooldownMs,
} from "@/lib/auth/otp";
import { sendLoginOtp } from "@/lib/auth/otp-delivery";
import { resendOtpSchema } from "@/lib/validation/otp";
import type { OtpChannel } from "@/src/db/schema";

export const runtime = "nodejs";

const RESEND_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

function resendOkShape(channel: OtpChannel) {
  return { ok: true, expiresInMs: otpTtlMs(channel), resendInMs: otpResendCooldownMs(channel) };
}

/** OTP resends: email over 15 min, SMS over 5 min (per identifier). */
function resendRateWindowMs(channel: OtpChannel): number {
  return channel === "sms" ? 5 * 60 * 1000 : 15 * 60 * 1000;
}

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: RESEND_RATE_LIMIT.limit,
      windowMs: RESEND_RATE_LIMIT.windowMs,
      key: (request) => `otp-resend:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: resendOtpSchema },
    audit: true,
  },
  async (request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const identifier =
      body.channel === "sms"
        ? { phone: body.phone }
        : { email: body.email };
    const identifierKey =
      body.channel === "sms" ? body.phone : body.email;

    const identifierLimit = await rateLimit(
      `otp-resend-${body.channel}:${identifierKey}`,
      RESEND_RATE_LIMIT.limit,
      resendRateWindowMs(body.channel),
    );
    if (!identifierLimit.allowed) {
      return jsonError("RATE_LIMITED", "Too many attempts. Please try again later.", 429);
    }

    const user = await getLoginUserByIdentifier(identifier);
    const canReceive =
      user &&
      user.isActive &&
      !user.isBanned &&
      !(user.lockedUntil && user.lockedUntil.getTime() > Date.now());

    // Enumeration-safe: same response shape as a successful resend.
    if (!user || !canReceive) {
      return jsonOk(resendOkShape(body.channel));
    }

    const resend = await resendLoginOtp(user.id, body.channel);

    // Still cooling down: tell the client how long to wait.
    if (!resend.ok && resend.reason === "RESEND_COOLDOWN") {
      return jsonError(
        "RESEND_COOLDOWN",
        "Please wait before requesting another code.",
        429,
        { retryAfterMs: resend.retryAfterMs },
      );
    }

    // No active row or the resend cap is hit: fall back to a fresh code on the
    // requested channel so the user is never stuck on the verify step.
    const code =
      resend.ok ? resend.code : (await issueLoginOtp(user.id, body.channel)).code;
    return deliver(user.id, user.phone ?? identifierKey, user.email, body.channel, code);
  },
);

/** Sends `code` (or a freshly issued one) and returns the client response. */
async function deliver(
  userId: string,
  phone: string,
  email: string,
  channel: OtpChannel,
  code?: string,
): Promise<NextResponse> {
  const t = await getApiTranslations("/api/v1/auth/otp/resend");
  const resolvedCode =
    code ?? (await issueLoginOtp(userId, channel)).code;

  try {
    await sendLoginOtp({
      channel,
      phone,
      email,
      code: resolvedCode,
      smsText: t("login.otp.smsMessage", { code: resolvedCode }),
      emailSubject: t("login.otp.emailSubject"),
      emailHtml: t("login.otp.emailBody", { code: resolvedCode }),
    });
  } catch (error) {
    await invalidateLatestLoginOtp(userId);
    if (error instanceof ApiError && error.code === "OTP_PROVIDER_UNAVAILABLE") {
      return jsonError(
        "PROVIDER_UNAVAILABLE",
        "We couldn't send the code. Please try again.",
        502,
      );
    }
    throw error;
  }
  return jsonOk(resendOkShape(channel));
}
