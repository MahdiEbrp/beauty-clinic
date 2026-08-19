import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { ApiError } from "@/lib/api/errors";
import { ensureStorage, getStorageConfig } from "@/lib/storage/config";
import * as fss from "@/lib/storage/fs";
import { ensureAllowed } from "@/lib/storage/guards";
import {
  joinRel,
  normalizeRelativePath,
  realPathWithin,
  resolveSafePath,
  sanitizeName,
} from "@/lib/storage/paths";
import type { EntryMeta } from "./service";

/**
 * Streams an uploaded file to `<folder>/<name>`, rejecting oversized payloads.
 * The file is staged inside a hidden temp dir (outside the served tree) and
 * atomically renamed into place.
 */
export async function uploadFile(
  folderRel: string,
  fileName: string,
  stream: ReadableStream<Uint8Array>,
  declaredSize: number,
): Promise<EntryMeta> {
  await ensureStorage();
  const folder = normalizeRelativePath(folderRel);
  ensureAllowed(folder);
  const name = sanitizeName(fileName);
  const rel = joinRel(folder, name);
  const config = getStorageConfig();
  const root = config.root;
  const maxBytes = config.maxBytes;

  if (declaredSize > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The uploaded file exceeds the maximum size.");
  }
  const abs = resolveSafePath(root, rel);
  const real = await realPathWithin(root, abs);
  if (await fss.exists(real)) {
    throw new ApiError(409, "CONFLICT", "A file with this name already exists in this folder.");
  }

  const tempDir = await fss.createTempDir(config.metaRoot);
  const stage = path.join(tempDir, name);
  const parts: Buffer<ArrayBufferLike>[] = [];
  let written = 0;
  try {
    const nodeStream = Readable.fromWeb(stream as never);
    for await (const chunk of nodeStream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      written += buf.length;
      if (written > maxBytes) {
        throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The uploaded file exceeds the maximum size.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Buffer is compatible with Buffer<ArrayBufferLike>
      parts.push(buf);
    }
    if (written === 0) {
      throw new ApiError(400, "EMPTY_FILE", "The uploaded file is empty.");
    }
    await fss.mkdirRecursive(path.dirname(real));
    await fss.writeFile(stage, Buffer.concat(parts, written));
    await fss.renameEntry(stage, real);
  } catch (error) {
    await fss.removeEntry(tempDir, true).catch(() => undefined);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "INTERNAL_ERROR", "Failed to store the uploaded file.");
  } finally {
    await fss.removeEntry(tempDir, true).catch(() => undefined);
  }

  const stat = await fs.stat(real);
  return { name, isDir: false, size: stat.size, mtimeMs: stat.mtimeMs };
}
