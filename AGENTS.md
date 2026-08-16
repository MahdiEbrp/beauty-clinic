# Project Rules

- **Never create files larger than 300 lines.** Split oversized logic into smaller, focused modules.
- **Never exceed the database connection limit.** The Postgres pool in `src/db/index.ts` is capped at `max: 5` connections. Rules:
  - Never issue more than ~3 concurrent queries (no `Promise.all` fan-out of many queries in one request).
  - Never nest a query inside a transaction that needs its own pool connection (deadlocks with `max: 1`, blocks the pool beyond that).
  - Avoid N+1 patterns: always batch lookups with `inArray` (e.g. `loadGroupTranslations`, category/service counts) instead of per-row queries.
  - Prefer sequential queries when parallelism isn't required.

## Design rules (distilled)

Full rulebook: `DESIGN_RULES.md` — read it before any UI/design work.

- Design tokens only — no hex/inline colors, no arbitrary spacing; spacing on the 4/8px scale, shadows from the elevation scale, radius from tokens.
- Icons only from `lucide-react`; never raw/inline SVG.
- No hardcoded strings in JSX — always `t()` / `useTranslations`; every key in both `messages/en.json` and `messages/fa.json`.
- Full RTL: logical properties (`start`/`end`, `ms`/`me`), `rtl-mirror` on directional icons; responsive from 4k down to 300px.
- Interactives ≥ 44×44px; never remove focus rings (`focus-visible:outline-accent`).
- Images use native `<img>` (never `next/image`), so pre-signed/third-party URLs load directly in the browser; Persian digits via the `ss01` font feature (Estedad), never `Intl.NumberFormat` fa digits.
- Lists/tables need dedicated empty + error states and skeleton loading.

## Routing conventions

- All pages live under `app/[locale]/`; `params`/`searchParams` are Promises — always `await`. Locale prefix is as-needed, default `fa` (`src/i18n/routing.ts`).
- Use `Link`/`useRouter`/`usePathname`/`redirect` from `@/src/i18n/navigation` — never `next/link`/`next/navigation` for internal routes.
- Dashboard routes go in the `(protected)` route group; guard server-side with `requirePermission(...)` from `@/lib/auth/dal`.
- API routes live under `app/api/v1/`; wrap every handler with `withSecurity({ auth, permissions, validate, audit })` from `@/lib/api/security`, return `jsonOk`/`jsonError`, and use the uniform `{ error: { code, message } }` envelope; `export const runtime = "nodejs"` when touching the DB.
- List endpoints are paginated (`page`/`perPage`/`search`/`status`); validate UUID ids before DB access.
- Dashboard pages use `generateMetadata` + `getTranslations({ locale, namespace })`, canonical + `alternates.languages` for fa/en, and `robots: { index: false }`.

## Security lint rules (`eslint-plugin-security`)

Lint runs with `eslint --max-warnings=300` — security findings are treated as **errors you must fix, never disable with `eslint-disable`**. Prefer safe, dependency-free code; only use a targeted disable comment with the exact rule name when the pattern is genuinely safe (e.g. a fixed, closed key set) and add `-- safe: <reason>`.

Ruleset in scope (docs live under `node_modules/eslint-plugin-security/docs/rules/`):

- `detect-bidi-characters` — reject hidden Unicode (U+202E/U+202D etc.) that can spoof code/logic; keep direction-isolating characters like `…` (single char) out of identifiers and string literals.
- `detect-buffer-noassert`, `detect-eval-with-expression`, `detect-new-buffer`, `detect-no-csrf-before-method-override`, `detect-non-literal-fs-filename`, `detect-non-literal-regexp`, `detect-non-literal-require`, `detect-object-injection`, `detect-possible-timing-attacks`, `detect-pseudoRandomBytes`, `detect-unsafe-regex`, `detect-disable-mustache-escape`, `detect-child-process`.

Guidance:
- No `eval`, `new Function`, raw `child_process`/`vm` shells, or non-literal regex/fs/require.
- Dynamic lookups (e.g. `map[key]`) must be guarded by a safe fallback and, when the key set is fixed/typed, a scoped disable comment.
- Prefer `crypto.randomBytes`/`randomUUID` for randomness; never time-comparable string comparisons on secrets.
