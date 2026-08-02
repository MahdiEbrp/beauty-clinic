import { jsonError, jsonOk, withApiHandler } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";
import { clientIp, isSameOrigin, readJsonBody } from "@/lib/api/request";
import { loginUser } from "@/lib/auth/service";
import { logError } from "@/lib/log";
import { loginSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

const LOGIN_RATE_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 };

export const POST = withApiHandler(async (request, { requestId }) => {
  if (!isSameOrigin(request)) {
    logError("auth.csrf_blocked", { requestId, ip: clientIp(request) });
    return jsonError("CROSS_ORIGIN_FORBIDDEN", "Request origin is not allowed.", 403);
  }

  const ip = clientIp(request) ?? "unknown";
  const bucket = rateLimit(`login:${ip}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs);
  if (!bucket.allowed) {
    logError("auth.rate_limited", { requestId, ip });
    return jsonError("RATE_LIMITED", "Too many attempts. Please try again later.", 429);
  }

  const body = await readJsonBody(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Invalid credentials format.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ok = await loginUser(parsed.data.email, parsed.data.password, { userAgent, ip });

  if (!ok) {
    logError("auth.login_failed", { requestId, ip });
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  return jsonOk({ ok: true });
});
