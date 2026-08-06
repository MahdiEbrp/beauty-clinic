import path from "node:path";

import { env } from "@/lib/env";

export const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
export const MAX_JSON_BODY_BYTES = 1024 * 1024;

export interface StorageConfig {
  root: string;
  maxBytes: number;
}

let override: Partial<StorageConfig> | undefined;

/** Test-only hook to redirect the storage root without touching process.env. */
export function setStorageConfigForTests(value: Partial<StorageConfig> | undefined): void {
  override = value;
}

export function getStorageConfig(): StorageConfig {
  const root = override?.root ?? path.resolve(env.FILE_STORAGE_ROOT ?? "./storage");
  const maxBytes = override?.maxBytes ?? env.FILE_MAX_BYTES ?? DEFAULT_MAX_BYTES;
  return { root, maxBytes };
}
