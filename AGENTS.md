# Project Rules

- **Never create files larger than 300 lines.** Split oversized logic into smaller, focused modules.
- **Never exceed the database connection limit.** The Postgres pool in `src/db/index.ts` is capped at `max: 5` connections. Rules:
  - Never issue more than ~3 concurrent queries (no `Promise.all` fan-out of many queries in one request).
  - Never nest a query inside a transaction that needs its own pool connection (deadlocks with `max: 1`, blocks the pool beyond that).
  - Avoid N+1 patterns: always batch lookups with `inArray` (e.g. `loadGroupTranslations`, category/service counts) instead of per-row queries.
  - Prefer sequential queries when parallelism isn't required.
