import { ApiError } from "@/lib/api/errors";

export const HIDDEN_PREFIX = ".";

export function notFound(rel: string, kind: "file" | "folder" | "entry" | "trash entry"): never {
  throw new ApiError(404, "NOT_FOUND", `The ${kind} "${rel}" does not exist.`);
}

export function ensureAllowed(rel: string): void {
  const segments = rel === "" ? [] : rel.split("/");
  if (segments.some((s) => s.startsWith(HIDDEN_PREFIX))) {
    throw new ApiError(403, "FORBIDDEN", "This entry is not accessible.");
  }
}
