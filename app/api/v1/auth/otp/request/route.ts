import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { getApiTranslations } from "@/lib/i18n/api-translations";
import { ApiError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/rate-limit";
import {
  getLoginUserByIdentifier,
  invalidateLatestLoginOtp,
  issueLoginOtp,
  otpTtlMs,
  otpResendCooldownMs,
} from "@/lib/auth/otp";
import { sendLoginOtp } from "@/lib/auth/otp-delivery";
import { requestOtpSchema } from "@/lib/validation/otp";
import type { OtpChannel } from "@/src/db/schema";

export const runtime = "nodejs";

/** OTP requests: email over 15 min, SMS over 5 min (per identifier). */
function otpRateWindowMs(channel: OtpChannel): number {
  return channel === "sms" ? 5 * 60 * 1000 : 15 * 60 * 1000;
}
const otpChannelLimit = 5;
const REQUEST_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: REQUEST_RATE_LIMIT.limit,
      windowMs: REQUEST_RATE_LIMIT.windowMs,
      key: (request) => `otp-request:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: requestOtpSchema },
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

    // Per-identifier limiter on top of the per-IP one: SMS/email bombing protection.
    const identifierLimit = await rateLimit(
      `otp-request-${body.channel}:${identifierKey}`,
      otpChannelLimit,
      otpRateWindowMs(body.channel),
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

    // Enumeration-safe: unknown/disabled accounts get the identical response
    // shape as a real send, just without a code going out.
    if (!user || !canReceive) {
      return jsonOk({
        ok: true,
        expiresInMs: otpTtlMs(body.channel),
        resendInMs: otpResendCooldownMs(body.channel),
      });
    }

    const { code } = await issueLoginOtp(user.id, body.channel);
    const t = await getApiTranslations(new URL(request.url).pathname);

    try {
      await sendLoginOtp({
        channel: body.channel,
        phone: user.phone ?? identifierKey,
        email: user.email,
        code,
        smsText: t("login.otp.smsMessage", { code }),
        emailSubject: t("login.otp.emailSubject"),
        emailHtml: t("login.otp.emailBody", { code, name: user.fullName }),
      });
    } catch (error) {
      await invalidateLatestLoginOtp(user.id);
      if (error instanceof ApiError && error.code === "OTP_PROVIDER_UNAVAILABLE") {
        return jsonError(
          "PROVIDER_UNAVAILABLE",
          "We couldn't send the code. Please try again.",
          502,
        );
      }
      throw error;
    }

    return jsonOk({
      ok: true,
      expiresInMs: otpTtlMs(body.channel),
      resendInMs: otpResendCooldownMs(body.channel),
    });
  },
);
