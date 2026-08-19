import fs from "node:fs/promises";
import path from "node:path";

import { ApiError } from "@/lib/api/errors";
import { ensureStorage, getStorageConfig } from "@/lib/storage/config";
import * as fss from "@/lib/storage/fs";
import { ensureAllowed, HIDDEN_PREFIX, notFound } from "@/lib/storage/guards";
import { isTextMime, mimeFromName } from "@/lib/storage/mime";
import {
  joinRel,
  normalizeRelativePath,
  realPathWithin,
  resolveSafePath,
  sanitizeName,
  splitPath,
} from "@/lib/storage/paths";
import {
  deleteForever as deleteForeverTrash,
  listTrash as listTrashItems,
  restoreEntry as restoreTrashEntry,
  trashEntry as trashEntryItem,
  type TrashItem,
} from "@/lib/storage/trash";

export type { TrashItem };

export interface EntryMeta {
  name: string;
  isDir: boolean;
  size: number;
  mtimeMs: number;
}

export interface FolderListing {
  path: string;
  entries: EntryMeta[];
}

export interface TextContent {
  path: string;
  name: string;
  mime: string;
  size: number;
  content: string;
}

export interface DownloadTarget {
  path: string;
  name: string;
  mime: string;
  size: number;
}

export async function listFolder(rel: string): Promise<FolderListing> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (!(await fss.isDirectory(real))) {
    await notFound(normalized || "/", "folder");
  }
  const entries = await fss.listDir(real);
  return {
    path: normalized,
    entries: entries
      .filter((entry) => !entry.name.startsWith(HIDDEN_PREFIX) && !entry.isSymlink)
      .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name)),
  };
}

export async function ensureFolder(rel: string): Promise<EntryMeta> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  if (normalized === "") {
    throw new ApiError(400, "INVALID_NAME", "The root folder cannot be recreated.");
  }
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (await fss.isDirectory(real)) {
    const stat = await fs.stat(real);
    return { name: splitPath(normalized).name, isDir: true, size: stat.size, mtimeMs: stat.mtimeMs };
  }
  if (await fss.exists(real)) {
    throw new ApiError(409, "CONFLICT", "A file with this name already exists.");
  }
  await fss.mkdirRecursive(real);
  const stat = await fs.stat(real);
  return { name: splitPath(normalized).name, isDir: true, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function createFile(rel: string, content?: string): Promise<EntryMeta> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (await fss.exists(real)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists.");
  }
  await fss.mkdirRecursive(path.dirname(real));
  await fss.writeFile(real, content === undefined ? Buffer.alloc(0) : Buffer.from(content, "utf8"));
  const stat = await fs.stat(real);
  return { name: splitPath(normalized).name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function readTextContent(rel: string): Promise<TextContent> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (!(await fss.isFile(real))) {
    await notFound(normalized, "file");
  }
  const mime = mimeFromName(splitPath(normalized).name);
  if (!isTextMime(mime)) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "This file type cannot be edited here.");
  }
  const buffer = await fss.readFile(real);
  if (buffer.length > 4 * 1024 * 1024) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "This file is too large to edit here.");
  }
  return {
    path: normalized,
    name: splitPath(normalized).name,
    mime,
    size: buffer.length,
    content: buffer.toString("utf8"),
  };
}

export async function writeTextContent(rel: string, content: string): Promise<EntryMeta> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (!(await fss.isFile(real))) {
    await notFound(normalized, "file");
  }
  const buffer = Buffer.from(content ?? "", "utf8");
  if (buffer.length > getStorageConfig().maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The content exceeds the maximum file size.");
  }
  await fss.writeFile(real, buffer);
  const stat = await fs.stat(real);
  return { name: splitPath(normalized).name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function renameEntry(rel: string, newName: string): Promise<EntryMeta> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const name = sanitizeName(newName);
  const { parent } = splitPath(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (!(await fss.exists(real))) {
    await notFound(normalized, "entry");
  }
  const targetText = resolveSafePath(config.root, joinRel(parent, name));
  const target = await realPathWithin(config.root, targetText);
  if (target === real) {
    const stat = await fs.stat(real);
    return {
      name,
      isDir: stat.isDirectory(),
      size: stat.isDirectory() ? 0 : stat.size,
      mtimeMs: stat.mtimeMs,
    };
  }
  if (await fss.exists(target)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists.");
  }
  await fss.renameEntry(real, target);
  const stat = await fs.stat(target);
  return {
    name,
    isDir: stat.isDirectory(),
    size: stat.isDirectory() ? 0 : stat.size,
    mtimeMs: stat.mtimeMs,
  };
}

export async function trashEntry(rel: string): Promise<void> {
  return trashEntryItem(rel);
}

export async function restoreEntry(trashPath: string): Promise<void> {
  return restoreTrashEntry(trashPath);
}

export async function listTrash(): Promise<TrashItem[]> {
  return listTrashItems();
}

export async function deleteForever(trashPath: string): Promise<void> {
  return deleteForeverTrash(trashPath);
}

export async function download(rel: string): Promise<DownloadTarget> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const real = await realPathWithin(config.root, abs);
  if (!(await fss.isFile(real))) {
    await notFound(normalized, "file");
  }
  const stat = await fs.stat(real);
  return { path: real, name: splitPath(normalized).name, mime: mimeFromName(normalized), size: stat.size };
}

export async function copyEntry(rel: string, targetRel: string): Promise<void> {
  await ensureStorage();
  const normalized = normalizeRelativePath(rel);
  const target = normalizeRelativePath(targetRel);
  ensureAllowed(normalized);
  ensureAllowed(target);
  const config = getStorageConfig();
  const abs = resolveSafePath(config.root, normalized);
  const targetAbs = resolveSafePath(config.root, target);
  const real = await realPathWithin(config.root, abs);
  const targetReal = await realPathWithin(config.root, targetAbs);
  if (!(await fss.exists(real))) {
    await notFound(normalized, "entry");
  }
  if (await fss.exists(targetReal)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists at the target location.");
  }
  if (targetReal === real || targetReal.startsWith(`${real}${path.sep}`)) {
    throw new ApiError(400, "INVALID_PATH", "Cannot copy an entry into itself.");
  }
  await fss.copyEntry(real, targetReal);
}

export { uploadFile } from "./upload";