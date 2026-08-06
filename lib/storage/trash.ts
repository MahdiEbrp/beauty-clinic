import path from "node:path";

import { ApiError } from "@/lib/api/errors";
import { getStorageConfig } from "@/lib/storage/config";
import * as fss from "@/lib/storage/fs";
import { ensureAllowed, notFound } from "@/lib/storage/guards";
import {
  joinRel,
  normalizeRelativePath,
  resolveSafePath,
  splitPath,
} from "@/lib/storage/paths";

const TRASH_FOLDER = ".trash";

export interface TrashItem {
  trashPath: string;
  originalPath: string;
}

function trashRelFor(original: string): string {
  return joinRel(TRASH_FOLDER, Buffer.from(original, "utf8").toString("base64url"));
}

function originalFromTrash(trashPath: string): string | undefined {
  const { name } = splitPath(trashPath);
  try {
    return normalizeRelativePath(Buffer.from(name, "base64url").toString("utf8")) || undefined;
  } catch {
    return undefined;
  }
}

/** Trash entries are addressed by paths that must stay inside `.trash`. */
function assertTrashPath(rel: string): string {
  const normalized = normalizeRelativePath(rel);
  if (!normalized.startsWith(`${TRASH_FOLDER}/`)) {
    throw new ApiError(403, "FORBIDDEN", "This entry is not accessible.");
  }
  return normalized;
}

export async function trashEntry(rel: string): Promise<void> {
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const root = getStorageConfig().root;
  const abs = resolveSafePath(root, normalized);
  if (!(await fss.exists(abs))) {
    await notFound(normalized, "entry");
  }
  const target = resolveSafePath(root, trashRelFor(normalized));
  await fss.mkdirRecursive(path.dirname(target));
  await fss.renameEntry(abs, target);
}

export async function restoreEntry(trashPath: string): Promise<void> {
  const normalized = assertTrashPath(trashPath);
  const root = getStorageConfig().root;
  const abs = resolveSafePath(root, normalized);
  if (!(await fss.exists(abs))) {
    await notFound(normalized, "trash entry");
  }
  const originalPath = originalFromTrash(normalized);
  if (originalPath === undefined) {
    return notFound(normalized, "trash entry");
  }
  ensureAllowed(originalPath);
  const target = resolveSafePath(root, originalPath);
  if (await fss.exists(target)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists at the original location.");
  }
  await fss.mkdirRecursive(path.dirname(target));
  await fss.renameEntry(abs, target);
}

export async function listTrash(): Promise<TrashItem[]> {
  const root = getStorageConfig().root;
  const trashDir = resolveSafePath(root, TRASH_FOLDER);
  if (!(await fss.isDirectory(trashDir))) {
    return [];
  }
  const entries = await fss.listDir(trashDir);
  const items: TrashItem[] = [];
  for (const entry of entries) {
    const originalPath = originalFromTrash(entry.name);
    if (originalPath === undefined) continue;
    items.push({ trashPath: joinRel(TRASH_FOLDER, entry.name), originalPath });
  }
  return items.sort((a, b) => a.originalPath.localeCompare(b.originalPath));
}

export async function deleteForever(trashPath: string): Promise<void> {
  const normalized = assertTrashPath(trashPath);
  const root = getStorageConfig().root;
  const abs = resolveSafePath(root, normalized);
  if (!(await fss.exists(abs))) {
    await notFound(normalized, "trash entry");
  }
  await fss.removeEntry(abs, true);
}
