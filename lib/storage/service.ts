import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { ApiError } from "@/lib/api/errors";
import { getStorageConfig } from "@/lib/storage/config";
import * as fss from "@/lib/storage/fs";
import { ensureAllowed, HIDDEN_PREFIX, notFound } from "@/lib/storage/guards";
import { isTextMime, mimeFromName } from "@/lib/storage/mime";
import {
  joinRel,
  normalizeRelativePath,
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
  const normalized = normalizeRelativePath(rel);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (!(await fss.isDirectory(abs))) {
    await notFound(normalized || "/", "folder");
  }
  const entries = await fss.listDir(abs);
  return {
    path: normalized,
    entries: entries
      .filter((entry) => !entry.name.startsWith(HIDDEN_PREFIX))
      .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name)),
  };
}

export async function ensureFolder(rel: string): Promise<EntryMeta> {
  const normalized = normalizeRelativePath(rel);
  if (normalized === "") {
    throw new ApiError(400, "INVALID_NAME", "The root folder cannot be recreated.");
  }
  ensureAllowed(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (await fss.isDirectory(abs)) {
    const stat = await fs.stat(abs);
    return { name: splitPath(normalized).name, isDir: true, size: stat.size, mtimeMs: stat.mtimeMs };
  }
  if (await fss.exists(abs)) {
    throw new ApiError(409, "CONFLICT", "A file with this name already exists.");
  }
  await fss.mkdirRecursive(abs);
  const stat = await fs.stat(abs);
  return { name: splitPath(normalized).name, isDir: true, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function createFile(rel: string, content?: string): Promise<EntryMeta> {
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (await fss.exists(abs)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists.");
  }
  await fss.mkdirRecursive(path.dirname(abs));
  await fss.writeFile(abs, content === undefined ? Buffer.alloc(0) : Buffer.from(content, "utf8"));
  const stat = await fs.stat(abs);
  return { name: splitPath(normalized).name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function readTextContent(rel: string): Promise<TextContent> {
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (!(await fss.isFile(abs))) {
    await notFound(normalized, "file");
  }
  const mime = mimeFromName(splitPath(normalized).name);
  if (!isTextMime(mime)) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "This file type cannot be edited here.");
  }
  const buffer = await fss.readFile(abs);
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
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (!(await fss.isFile(abs))) {
    await notFound(normalized, "file");
  }
  const buffer = Buffer.from(content ?? "", "utf8");
  if (buffer.length > getStorageConfig().maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The content exceeds the maximum file size.");
  }
  await fss.writeFile(abs, buffer);
  const stat = await fs.stat(abs);
  return { name: splitPath(normalized).name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}

export async function renameEntry(rel: string, newName: string): Promise<EntryMeta> {
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const name = sanitizeName(newName);
  const { parent } = splitPath(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (!(await fss.exists(abs))) {
    await notFound(normalized, "entry");
  }
  const target = resolveSafePath(getStorageConfig().root, joinRel(parent, name));
  if (target === abs) return (await fss.isDirectory(abs) ? ensureFolder(normalized) : statEntry(normalized));
  if (await fss.exists(target)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists.");
  }
  await fss.renameEntry(abs, target);
  const stat = await fs.stat(target);
  return {
    name,
    isDir: stat.isDirectory(),
    size: stat.isDirectory() ? 0 : stat.size,
    mtimeMs: stat.mtimeMs,
  };
}

async function statEntry(rel: string): Promise<EntryMeta> {
  const normalized = normalizeRelativePath(rel);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  const stat = await fs.stat(abs);
  return { name: splitPath(normalized).name, isDir: stat.isDirectory(), size: stat.isDirectory() ? 0 : stat.size, mtimeMs: stat.mtimeMs };
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
  const normalized = normalizeRelativePath(rel);
  ensureAllowed(normalized);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  if (!(await fss.isFile(abs))) {
    await notFound(normalized, "file");
  }
  const stat = await fs.stat(abs);
  return { path: abs, name: splitPath(normalized).name, mime: mimeFromName(normalized), size: stat.size };
}

export async function copyEntry(rel: string, targetRel: string): Promise<void> {
  const normalized = normalizeRelativePath(rel);
  const target = normalizeRelativePath(targetRel);
  ensureAllowed(normalized);
  ensureAllowed(target);
  const abs = resolveSafePath(getStorageConfig().root, normalized);
  const targetAbs = resolveSafePath(getStorageConfig().root, target);
  if (!(await fss.exists(abs))) {
    await notFound(normalized, "entry");
  }
  if (await fss.exists(targetAbs)) {
    throw new ApiError(409, "CONFLICT", "An entry with this name already exists at the target location.");
  }
  if (targetAbs === abs || targetAbs.startsWith(`${abs}${path.sep}`)) {
    throw new ApiError(400, "INVALID_PATH", "Cannot copy an entry into itself.");
  }
  await fss.copyEntry(abs, targetAbs);
}

/**
 * Streams an uploaded file to `<folder>/<name>`, rejecting oversized payloads.
 * The file is staged inside a hidden temp dir and atomically renamed into place.
 */
export async function uploadFile(
  folderRel: string,
  fileName: string,
  stream: ReadableStream<Uint8Array>,
  declaredSize: number,
): Promise<EntryMeta> {
  const folder = normalizeRelativePath(folderRel);
  ensureAllowed(folder);
  const name = sanitizeName(fileName);
  const rel = joinRel(folder, name);
  const root = getStorageConfig().root;
  const maxBytes = getStorageConfig().maxBytes;

  if (declaredSize > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The uploaded file exceeds the maximum size.");
  }
  const abs = resolveSafePath(root, rel);
  if (await fss.exists(abs)) {
    throw new ApiError(409, "CONFLICT", "A file with this name already exists in this folder.");
  }

  const tempDir = await fss.createTempDir(root);
  const stage = path.join(tempDir, name);
  const parts: Buffer[] = [];
  let written = 0;
  try {
    const nodeStream = Readable.fromWeb(stream as never);
    for await (const chunk of nodeStream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      written += buf.length;
      if (written > maxBytes) {
        throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The uploaded file exceeds the maximum size.");
      }
      parts.push(buf);
    }
    if (written === 0) {
      throw new ApiError(400, "EMPTY_FILE", "The uploaded file is empty.");
    }
    await fss.mkdirRecursive(path.dirname(abs));
    await fss.writeFile(stage, Buffer.concat(parts, written));
    await fss.renameEntry(stage, abs);
  } catch (error) {
    await fss.removeEntry(tempDir, true).catch(() => undefined);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "INTERNAL_ERROR", "Failed to store the uploaded file.");
  } finally {
    await fss.removeEntry(tempDir, true).catch(() => undefined);
  }

  const stat = await fs.stat(abs);
  return { name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}
