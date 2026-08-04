import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { registerUser } from "@/lib/auth/service";
import { signupSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

// Stricter than login: self-registration is a spam vector and each success
// creates a real account + session.
const REGISTER_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: REGISTER_RATE_LIMIT.limit,
      windowMs: REGISTER_RATE_LIMIT.windowMs,
      key: (request) => `register:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: signupSchema },
    audit: true,
  },
  async (request, ctx) => {
    // `sessions.ip` is an `inet` column: pass undefined (→ NULL) when no
    // trusted header exists, never a placeholder like "unknown".
    const ip = clientIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const result = await registerUser(ctx.body!, { userAgent, ip });

    if (!result.ok) {
      return jsonError(
        "EMAIL_TAKEN",
        "An account with this email already exists.",
        409,
      );
    }

    return jsonOk({ ok: true });
  },
);
