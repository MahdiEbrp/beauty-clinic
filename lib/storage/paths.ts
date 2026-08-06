import path from "node:path";

import { ApiError } from "@/lib/api/errors";

export const MAX_NAME_LENGTH = 255;
export const MAX_PATH_LENGTH = 2048;

/**
 * Path safety for the file manager. Every entry is addressed by a relative
 * path ("" = root, "docs/report.pdf" = nested). All functions here assume a
 * forward-slash, root-anchored, traversal-free representation.
 */

/**
 * Normalizes and validates a client-supplied relative path.
 * Rejects absolute paths, backslashes, empty segments and "." / ".." so no
 * caller can escape the storage root. Returns "" for the root folder.
 */
export function normalizeRelativePath(relative: string): string {
  const source = relative ?? "";
  if (source.length > MAX_PATH_LENGTH) {
    throw new ApiError(400, "INVALID_PATH", "Path is too long.");
  }
  const normalized = source
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (normalized === "" || normalized === ".") return "";
  const parts = normalized.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new ApiError(400, "INVALID_PATH", "Invalid path.");
  }
  return parts.join("/");
}

/**
 * Resolves a relative path against the storage root and asserts the result
 * stays inside it (defense in depth against path traversal).
 */
export function resolveSafePath(root: string, relative: string): string {
  const normalized = normalizeRelativePath(relative);
  const rootResolved = path.resolve(root);
  const segments = normalized === "" ? [] : normalized.split("/");
  const target = path.resolve(rootResolved, ...segments);
  if (target !== rootResolved && !target.startsWith(`${rootResolved}${path.sep}`)) {
    throw new ApiError(400, "INVALID_PATH", "Path escapes the storage root.");
  }
  return target;
}

/** Validates a single entry name (no slashes, no dot segments, no null bytes). */
export function sanitizeName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === "" || trimmed === "." || trimmed === "..") {
    throw new ApiError(400, "INVALID_NAME", "Invalid file or folder name.");
  }
  if (trimmed.includes("/") || trimmed.includes("\\")) {
    throw new ApiError(400, "INVALID_NAME", "Names cannot contain slashes.");
  }
  if (trimmed.includes("\0")) {
    throw new ApiError(400, "INVALID_NAME", "Names cannot contain null bytes.");
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ApiError(400, "INVALID_NAME", "Name is too long.");
  }
  return trimmed;
}

/** Joins a relative folder path with an entry name into a relative entry path. */
export function joinRel(parent: string, name: string): string {
  const normalized = normalizeRelativePath(parent);
  return normalized === "" ? name : `${normalized}/${name}`;
}

/** Splits a relative entry path into its parent folder and entry name. */
export function splitPath(relative: string): { parent: string; name: string } {
  const normalized = normalizeRelativePath(relative);
  if (normalized === "") {
    throw new ApiError(400, "INVALID_PATH", "An entry path is required.");
  }
  const index = normalized.lastIndexOf("/");
  if (index === -1) return { parent: "", name: normalized };
  return { parent: normalized.slice(0, index), name: normalized.slice(index + 1) };
}

/** Lowercased extension without the leading dot ("" when none). */
export function extOf(name: string): string {
  const base = name.slice(name.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}
