/**
 * Converts a zod validation error into a flat `field → messages` map.
 *
 * zod's `error.flatten()` is deprecated in v4; this reads `error.issues`
 * directly and groups each issue by its top-level path segment.
 */
export function toFieldErrors(
  error: {
    issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>;
  },
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");

    (out[key] ??= []).push(issue.message);
  }
  return out;
}