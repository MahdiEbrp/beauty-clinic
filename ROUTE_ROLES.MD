# Next.js API Routes Security Checklist

A practical checklist for hardening API routes in Next.js (App Router `route.ts` handlers and Pages Router `pages/api`).

---

## 1. Input Validation

- [ ] Validate **every** input (body, query params, headers, route params) with a schema library (Zod, Valibot, Yup) — never trust `req.body` directly
- [ ] Reject unknown/extra fields (`z.object({...}).strict()`) to prevent mass-assignment
- [ ] Enforce types, lengths, and ranges (e.g. max string length, numeric bounds) to avoid resource exhaustion
- [ ] Validate `Content-Type` header matches expected payload (e.g. reject non-JSON on JSON endpoints)
- [ ] Cap request body size (`bodyParser.sizeLimit` in Pages Router; middleware check in App Router) to prevent large-payload DoS
- [ ] Sanitize any input that will be rendered, logged, or used in a shell/DB command

## 2. Authentication

- [ ] Every route confirms *who* is calling — never rely on the client to self-report identity
- [ ] Use signed, httpOnly, secure cookies or verified JWT/session tokens — never trust a plain header like `x-user-id`
- [ ] Verify tokens server-side on every request (signature, expiry, issuer) — don't just decode without verifying
- [ ] Set short token/session expiry and support revocation (deny-list or session store)
- [ ] Apply auth checks in the route handler itself, not just in middleware (defense in depth — middleware can be misconfigured or bypassed by matcher gaps)

## 3. Authorization

- [ ] Check *ownership*, not just authentication — a logged-in user shouldn't automatically access another user's resource (IDOR)
- [ ] Re-verify permissions on every mutating request; don't cache authorization decisions client-side
- [ ] Use role/permission checks server-side (RBAC/ABAC), never trust a role sent from the client
- [ ] For nested resources, verify the full ownership chain (e.g. "does this user own the *team* that owns this *project*?")

## 4. Rate Limiting & Abuse Prevention

- [ ] Apply rate limiting per IP and per user/API key (e.g. Upstash Ratelimit, `@vercel/firewall`, or a custom Redis-backed limiter)
- [ ] Apply stricter limits to expensive routes (auth, search, AI/LLM calls, email sending)
- [ ] Add CAPTCHA or proof-of-work on public unauthenticated forms (signup, contact, password reset)
- [ ] Return generic `429` responses without leaking internal rate-limit logic

## 5. CORS Configuration

- [ ] Do **not** default to `Access-Control-Allow-Origin: *` on routes that handle cookies/auth
- [ ] Explicitly allowlist trusted origins instead of reflecting the `Origin` header
- [ ] Set `Access-Control-Allow-Credentials: true` only alongside a specific (non-wildcard) origin
- [ ] Restrict `Access-Control-Allow-Methods` to only what each route needs

## 6. CSRF Protection

- [ ] Use `SameSite=Lax` or `SameSite=Strict` cookies for session tokens where possible
- [ ] For cookie-authenticated state-changing routes (POST/PUT/DELETE), verify a CSRF token or use double-submit cookie pattern
- [ ] Check `Origin`/`Referer` headers as a secondary defense on sensitive mutations

## 7. Secrets & Environment Variables

- [ ] Never expose secrets via `NEXT_PUBLIC_*` env vars — those are bundled into client JS
- [ ] Keep API keys, DB credentials, and signing secrets server-only (`.env.local`, not committed to git)
- [ ] Rotate secrets regularly and immediately after any suspected leak
- [ ] Use a secrets manager (Vercel env vars, Doppler, AWS Secrets Manager) in production rather than plaintext `.env` files

## 8. Database & Injection Safety

- [ ] Use parameterized queries / an ORM (Prisma, Drizzle) — never string-concatenate SQL
- [ ] Avoid `eval`, `Function()`, or dynamic `require()` on any user-controlled input
- [ ] Sanitize inputs used in NoSQL queries (MongoDB operator injection, e.g. `$gt`/`$ne` payloads)
- [ ] Escape/validate inputs used in file paths to prevent path traversal (`../../etc/passwd`)

## 9. Error Handling & Information Disclosure

- [ ] Never return raw stack traces, SQL errors, or internal file paths to the client
- [ ] Use a centralized error handler that logs details server-side and returns generic messages to the client
- [ ] Return consistent error shapes so client behavior can't be used to enumerate valid usernames/emails (avoid "user not found" vs "wrong password" distinctions)
- [ ] Set `NODE_ENV=production` in production so Next.js doesn't leak debug info

## 10. HTTP Method & Route Hygiene

- [ ] Explicitly handle only the HTTP methods you support; return `405` for others (App Router: only export the methods you need)
- [ ] Don't assume route matching is exhaustive — test that `/api/admin` isn't reachable via case variations, trailing slashes, or encoded paths
- [ ] Disable Next.js's `x-powered-by` header (`poweredByHeader: false` in `next.config.js`) to reduce fingerprinting

## 11. Security Headers

- [ ] Set `Content-Security-Policy` to restrict script/style/frame sources
- [ ] Set `X-Content-Type-Options: nosniff`
- [ ] Set `Strict-Transport-Security` (HSTS) to enforce HTTPS
- [ ] Set `X-Frame-Options: DENY` (or CSP `frame-ancestors`) to prevent clickjacking
- [ ] Configure these centrally via `next.config.js` `headers()` or middleware rather than per-route

## 12. File Uploads (if applicable)

- [ ] Validate file type by content/magic bytes, not just extension or client-reported MIME type
- [ ] Enforce max file size before reading the full body into memory
- [ ] Store uploads outside the public directory or in object storage (S3/R2), never execute them
- [ ] Generate randomized filenames server-side; never trust the client-provided filename for storage paths

## 13. Third-Party & Webhook Endpoints

- [ ] Verify webhook signatures (Stripe, GitHub, etc.) using the provider's signing secret before processing
- [ ] Reject webhook payloads with stale timestamps to prevent replay attacks
- [ ] Never call out to user-supplied URLs server-side without validation (SSRF risk) — allowlist domains/IP ranges if the feature requires fetching external URLs

## 14. Logging & Monitoring

- [ ] Log authentication failures, authorization failures, and rate-limit hits with enough context to investigate
- [ ] Avoid logging sensitive data (passwords, tokens, full card numbers, PII) in plaintext
- [ ] Set up alerting for anomalous patterns (spike in 401/403s, repeated failed logins)

## 15. Deployment & Infra

- [ ] Enforce HTTPS everywhere (redirect HTTP → HTTPS)
- [ ] Keep Next.js and dependencies patched — subscribe to security advisories, run `npm audit`/`pnpm audit` in CI
- [ ] Use environment-specific configs so staging/dev secrets can never reach production
- [ ] If using edge/serverless functions, confirm cold-start behavior doesn't skip initialization of security middleware

---

### Quick Priority Order (if short on time)
1. Input validation (Zod schemas on every route)
2. Auth + authorization checks in each handler (not just middleware)
3. Rate limiting on public/expensive routes
4. Lock down CORS (no wildcard + credentials)
5. Generic error responses (no stack traces leaked)
