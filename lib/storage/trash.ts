import path from "node:path";

import { ApiError } from "@/lib/api/errors";
import { ensureStorage, getStorageConfig } from "@/lib/storage/config";
import * as fss from "@/lib/storage/fs";
import { ensureAllowed, notFound } from "@/lib/storage/guards";
import {
  joinRel,
  normalizeRelativePath,
  realPathWithin,
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
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const root = config.root;
  const abs = resolveSafePath(root, normalized);
  const real = await realPathWithin(root, abs);
  if (!(await fss.exists(real))) {
    await notFound(normalized, "entry");
  }
  const target = resolveSafePath(config.metaRoot, trashRelFor(normalized));
  const realTarget = await realPathWithin(config.metaRoot, target);
  await fss.mkdirRecursive(path.dirname(realTarget));
  await fss.renameEntry(real, realTarget);
}

export async function restoreEntry(trashPath: string): Promise<void> {
  await ensureStorage();
  const normalized = assertTrashPath(trashPath);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.metaRoot, normalized);
  const real = await realPathWithin(config.metaRoot, abs);
  if (!(await fss.exists(real))) {
    await notFound(normalized, "trash entry");
  }
  const originalPath = originalFromTrash(normalized);
  if (originalPath === undefined) {
    return notFound(normalized, "trash entry");
  }
  ensureAllowed(originalPath);
  const targetText = resolveSafePath(config.root, originalPath);
  const target = await realPathWithin(config.root, targetText);
  if (await fss.exists(target)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists at the original location.");
  }
  await fss.mkdirRecursive(path.dirname(target));
  await fss.renameEntry(real, target);
}

export async function listTrash(): Promise<TrashItem[]> {
  await ensureStorage();
  const config = getStorageConfig();
  const trashDir = resolveSafePath(config.metaRoot, TRASH_FOLDER);
  const real = await realPathWithin(config.metaRoot, trashDir);
  if (!(await fss.isDirectory(real))) {
    return [];
  }
  const entries = await fss.listDir(real);
  const items: TrashItem[] = [];
  for (const entry of entries) {
    const originalPath = originalFromTrash(entry.name);
    if (originalPath === undefined) continue;
    items.push({ trashPath: joinRel(TRASH_FOLDER, entry.name), originalPath });
  }
  return items.sort((a, b) => a.originalPath.localeCompare(b.originalPath));
}

export async function deleteForever(trashPath: string): Promise<void> {
  await ensureStorage();
  const normalized = assertTrashPath(trashPath);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.metaRoot, normalized);
  const real = await realPathWithin(config.metaRoot, abs);
  if (!(await fss.exists(real))) {
    await notFound(normalized, "trash entry");
  }
  await fss.removeEntry(real, true);
}