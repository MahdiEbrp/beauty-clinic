# Repair plan

## Goal
Fix all currently reported ESLint, test, and production build errors, then verify the repository checks pass.

## Phases

- [completed] 1. Establish baseline: inspect scripts and run lint, tests, and build.
- [completed] 2. Diagnose and fix lint/type errors.
- [completed] 3. Diagnose and fix test failures.
- [completed] 4. Diagnose and fix production build failures.
- [completed] 5. Re-run all checks and summarize changes.

## Next Step

All checks pass; hand off the repair summary.

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| `mock-db.ts` duplicate members, missing `Table.Symbol`, and unsupported query predicates | 1 | Pending targeted repair |
| 46 Vitest failures, mostly from `mock-db.ts`; site URL and encryption edge cases also fail | 1 | Pending targeted repair |
| ESLint explicit `any` error in `mock-db.ts` | 1 | Pending targeted repair |
