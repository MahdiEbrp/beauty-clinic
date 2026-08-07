import path from "node:path";

import { env } from "@/lib/env";
import { mkdirRecursive } from "@/lib/storage/fs";

export const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
export const MAX_JSON_BODY_BYTES = 1024 * 1024;

/** User-visible files live directly under the served `public/` tree. */
export const DEFAULT_STORAGE_ROOT = "./public";
/** Internal metadata (trash, staged uploads) is kept outside the served tree. */
export const DEFAULT_META_ROOT = path.resolve(process.cwd(), ".file-manager");

export interface StorageConfig {
  root: string;
  /** Internal-only location for trash and staged uploads; never served. */
  metaRoot: string;
  maxBytes: number;
}

let override: Partial<StorageConfig> | undefined;
let ready: Promise<void> | undefined;

/** Test-only hook to redirect the storage root without touching process.env. */
export function setStorageConfigForTests(value: Partial<StorageConfig> | undefined): void {
  override = value;
  ready = undefined;
}

export function getStorageConfig(): StorageConfig {
  const root = path.resolve(override?.root ?? env.FILE_STORAGE_ROOT ?? DEFAULT_STORAGE_ROOT);
  const maxBytes = override?.maxBytes ?? env.FILE_MAX_BYTES ?? DEFAULT_MAX_BYTES;
  // When tests override the root, keep the meta tree inside it so test runs
  // stay isolated. In production it lives outside `public/` and is never served.
  const metaRoot =
    override?.metaRoot ?? (override?.root ? path.join(root, ".meta") : DEFAULT_META_ROOT);
  return { root, maxBytes, metaRoot };
}

/**
 * Ensures the storage and metadata roots exist. Cached so it only performs the
 * filesystem work once per boot/test. Resets automatically when the test hook
 * re-points the roots.
 */
export function ensureStorage(): Promise<void> {
  if (ready === undefined) {
    const { root, metaRoot } = getStorageConfig();
    ready = Promise.all([mkdirRecursive(root), mkdirRecursive(metaRoot)]).then(
      () => undefined,
      (error) => {
        ready = undefined;
        throw error;
      },
    );
  }
  return ready;
}