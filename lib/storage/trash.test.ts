import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { setStorageConfigForTests } from "@/lib/storage/config";
import * as service from "@/lib/storage/service";
import * as trash from "@/lib/storage/trash";

let root = "";

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "trash-"));
  setStorageConfigForTests({ root, maxBytes: 1024 * 1024 });
});

afterEach(async () => {
  setStorageConfigForTests(undefined);
  await fs.rm(root, { recursive: true, force: true });
});

describe("trash module", () => {
  it("returns an empty list when nothing is trashed", async () => {
    expect(await trash.listTrash()).toEqual([]);
  });

  it("stores trash outside the served root under .trash", async () => {
    await service.createFile("report.txt", "x");
    await trash.trashEntry("report.txt");

    const items = await trash.listTrash();
    expect(items).toHaveLength(1);
    expect(items[0].originalPath).toBe("report.txt");
    expect(items[0].trashPath).toMatch(/^\.trash\//);
    // Nothing sensitive remains in the visible (served) tree.
    expect(await service.listFolder("")).toEqual({ path: "", entries: [] });
  });

  it("round-trips trash, restore and delete", async () => {
    await service.createFile("d/a.txt", "content");
    await trash.trashEntry("d/a.txt");
    const afterTrash = await trash.listTrash();
    expect(afterTrash).toHaveLength(1);

    await trash.restoreEntry(afterTrash[0].trashPath);
    expect((await service.readTextContent("d/a.txt")).content).toBe("content");
    expect(await trash.listTrash()).toEqual([]);

    await trash.trashEntry("d/a.txt");
    await trash.deleteForever((await trash.listTrash())[0].trashPath);
    expect(await trash.listTrash()).toEqual([]);
    await expect(service.readTextContent("d/a.txt")).rejects.toThrow(ApiError);
  });

  it("rejects restoring over an existing entry", async () => {
    await service.createFile("keep.txt", "keep");
    await trash.trashEntry("keep.txt");
    await service.createFile("keep.txt", "new");
    await expect(trash.restoreEntry((await trash.listTrash())[0].trashPath)).rejects.toThrow(ApiError);
  });

  it("rejects trash paths outside the .trash folder", async () => {
    await expect(trash.restoreEntry("docs/report.txt")).rejects.toThrow(ApiError);
    await expect(trash.deleteForever("whatever")).rejects.toThrow(ApiError);
  });

  it("treats an entry addressed by a path that does not exist as missing", async () => {
    await expect(trash.deleteForever(".trash/does-not-exist")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });
});