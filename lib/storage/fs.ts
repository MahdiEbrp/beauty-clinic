/* eslint-disable security/detect-non-literal-fs-filename -- every fs call receives an absolute path already resolved by resolveSafePath/realPathWithin */
import fs from "node:fs/promises";
import path from "node:path";

import { MAX_PATH_LENGTH } from "@/lib/storage/paths";

/**
 * Low-level async filesystem helpers used by the file-manager service. Every
 * function takes an already-resolved absolute path (see resolveSafePath) and
 * guards against passing an empty or absurdly long path to Node.
 */

function assertFsPath(absPath: string): void {
  if (!absPath || absPath.length === 0 || absPath.length > MAX_PATH_LENGTH) {
    throw new RangeError("Invalid absolute path.");
  }
}

export interface EntryInfo {
  name: string;
  isDir: boolean;
  isSymlink: boolean;
  size: number;
  mtimeMs: number;
}

export async function exists(absPath: string): Promise<boolean> {
  assertFsPath(absPath);
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(absPath: string): Promise<boolean> {
  assertFsPath(absPath);
  try {
    return (await fs.stat(absPath)).isDirectory();
  } catch {
    return false;
  }
}

export async function isFile(absPath: string): Promise<boolean> {
  assertFsPath(absPath);
  try {
    return (await fs.stat(absPath)).isFile();
  } catch {
    return false;
  }
}

export async function listDir(absPath: string): Promise<EntryInfo[]> {
  assertFsPath(absPath);
  const dirents = await fs.readdir(absPath, { withFileTypes: true });
  return Promise.all(
    dirents.map(async (dirent) => {
      const full = path.join(absPath, dirent.name);
      let size = 0;
      let mtimeMs = 0;
      try {
        const stat = await fs.stat(full);
        size = stat.size;
        mtimeMs = stat.mtimeMs;
      } catch {
        // Broken symlink or race with a concurrent delete: report defaults.
      }
      return { name: dirent.name, isDir: dirent.isDirectory(), isSymlink: dirent.isSymbolicLink(), size, mtimeMs };
    }),
  );
}

export async function mkdirRecursive(absPath: string): Promise<void> {
  assertFsPath(absPath);
  await fs.mkdir(absPath, { recursive: true });
}

export async function createDir(absPath: string): Promise<void> {
  assertFsPath(absPath);
  await fs.mkdir(absPath);
}

export async function removeEntry(absPath: string, recursive: boolean): Promise<void> {
  assertFsPath(absPath);
  await fs.rm(absPath, { recursive, force: true });
}

export async function writeFile(absPath: string, data: Buffer): Promise<void> {
  assertFsPath(absPath);
  await fs.writeFile(absPath, data);
}

export async function readFile(absPath: string): Promise<Buffer> {
  assertFsPath(absPath);
  return fs.readFile(absPath);
}

export async function renameEntry(from: string, to: string): Promise<void> {
  assertFsPath(from);
  assertFsPath(to);
  await fs.rename(from, to);
}

export async function copyEntry(from: string, to: string): Promise<void> {
  assertFsPath(from);
  assertFsPath(to);
  // force:false is required for errorOnExist to take effect; without it fs.cp
  // silently overwrites an existing destination.
  await fs.cp(from, to, { recursive: true, errorOnExist: true, force: false });
}

/**
 * Creates a fresh temp directory under the storage root (outside any user
 * folder) for staging moves/uploads before the final atomic rename.
 */
export async function createTempDir(root: string): Promise<string> {
  const tmp = path.join(root, ".tmp");
  await fs.mkdir(tmp, { recursive: true });
  return fs.mkdtemp(path.join(tmp, "move-"));
}
