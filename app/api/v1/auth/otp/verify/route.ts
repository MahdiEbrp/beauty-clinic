import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { verifyLoginOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { verifyOtpSchema } from "@/lib/validation/otp";

export const runtime = "nodejs";

const VERIFY_RATE_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: VERIFY_RATE_LIMIT.limit,
      windowMs: VERIFY_RATE_LIMIT.windowMs,
      key: (request) => `otp-verify:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: verifyOtpSchema },
    audit: true,
  },
  async (request, ctx) => {
    // `sessions.ip` is an `inet` column: pass undefined (→ NULL) when no
    // trusted header exists, never a placeholder like "unknown".
    const ip = clientIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();

    const result = await verifyLoginOtp(body.phone, body.code);

    if (!result.ok) {
      // USER_NOT_FOUND / NO_CODE are indistinguishable from a wrong code so
      // phone numbers can't be probed through this endpoint.
      switch (result.reason) {
        case "USER_NOT_FOUND":
        case "NO_CODE":
        case "INVALID_CODE":
          return jsonError("INVALID_CODE", "The code is invalid.", 401, {
            attemptsLeft: result.attemptsLeft,
          });
        case "CODE_EXPIRED":
          return jsonError("CODE_EXPIRED", "The code has expired.", 401);
        case "TOO_MANY_ATTEMPTS":
          return jsonError(
            "TOO_MANY_ATTEMPTS",
            "Too many incorrect attempts.",
            429,
            { attemptsLeft: 0 },
          );
        case "LOCKED_OUT":
          return jsonError(
            "LOCKED_OUT",
            "The account is temporarily locked.",
            423,
            { retryAfterMs: result.retryAfterMs },
          );
        case "ACCOUNT_INACTIVE":
        case "ACCOUNT_BANNED":
          return jsonError(
            "ACCOUNT_INACTIVE",
            "This account is not available.",
            403,
          );
      }
    }

    await createSession(result.user.id, userAgent, ip);
    return jsonOk({ ok: true });
  },
);
