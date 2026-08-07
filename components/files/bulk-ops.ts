import { joinRel } from "./helpers";
import type { EntryMeta } from "./types";

export interface BulkResult {
  ok: number;
  failed: number;
}

async function postJson(url: string, body: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("action_failed");
}

/** Downloads every selected file (folders are skipped) via anchor clicks. */
export function bulkDownload(folder: string, entries: EntryMeta[]): void {
  for (const entry of entries) {
    if (entry.isDir) continue;
    const qs = new URLSearchParams({ path: joinRel(folder, entry.name) });
    const anchor = document.createElement("a");
    anchor.href = `/api/v1/files/download?${qs.toString()}`;
    anchor.rel = "noopener";
    anchor.click();
  }
}

/** Copies each selected entry into the target folder. */
export async function copyEntries(
  folder: string,
  entries: EntryMeta[],
  targetFolder: string,
): Promise<BulkResult> {
  let ok = 0;
  let failed = 0;
  for (const entry of entries) {
    try {
      await postJson("/api/v1/files/copy", {
        path: joinRel(folder, entry.name),
        target: joinRel(targetFolder, entry.name),
      });
      ok += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed };
}

/** Moves each selected entry to the trash; the failed count drives partial-failure toasts. */
export async function trashEntries(
  folder: string,
  entries: EntryMeta[],
): Promise<BulkResult> {
  let ok = 0;
  let failed = 0;
  for (const entry of entries) {
    try {
      await postJson("/api/v1/files/trash", { path: joinRel(folder, entry.name) });
      ok += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed };
}