export type CsrfResult = { ok: true } | { ok: false };

/**
 * Edge-safe CSRF check: the Origin (falling back to Referer) must match the
 * Host. Browsers always send Origin on cross-origin writes, so a mismatch
 * means a cross-site request. Pure header logic — no runtime dependencies.
 */
export function checkCsrf(request: { headers: Headers }): CsrfResult {
  const host = request.headers.get("host");
  if (!host) return { ok: false };

  const origin = request.headers.get("origin");
  if (origin) {
    if (origin === "null") return { ok: false };
    try {
      return new URL(origin).host === host ? { ok: true } : { ok: false };
    } catch {
      return { ok: false };
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host ? { ok: true } : { ok: false };
    } catch {
      return { ok: false };
    }
  }

  return { ok: false };
}
