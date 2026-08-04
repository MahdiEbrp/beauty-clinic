import { withSecurity, jsonError, jsonOk } from "@/lib/api/security";
import { clientIp } from "@/lib/api/request";
import { loginUser } from "@/lib/auth/service";
import { loginSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

const LOGIN_RATE_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 };

export const POST = withSecurity(
  {
    auth: "public",
    rateLimit: {
      limit: LOGIN_RATE_LIMIT.limit,
      windowMs: LOGIN_RATE_LIMIT.windowMs,
      key: (request) => `login:${clientIp(request) ?? "unknown"}`,
    },
    validate: { body: loginSchema },
    audit: true,
  },
  async (request, ctx) => {
    // `sessions.ip` is an `inet` column: pass undefined (→ NULL) when no
    // trusted header exists, never a placeholder like "unknown".
    const ip = clientIp(request);
    const { email, password } = ctx.body!;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const ok = await loginUser(email, password, { userAgent, ip });

    if (!ok) {
      return jsonError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
    }

    return jsonOk({ ok: true });
  },
);
