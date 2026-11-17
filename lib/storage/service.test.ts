import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { setStorageConfigForTests } from "@/lib/storage/config";
import * as service from "@/lib/storage/service";

let root = "";

function toWebStream(data: string | Buffer): ReadableStream<Uint8Array> {
  const buffer = Buffer.from(data);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(buffer);
      controller.close();
    },
  });
}

function toChunkedWebStream(chunks: Array<string | Buffer>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(Buffer.from(chunk));
      controller.close();
    },
  });
}

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "fm-"));
  setStorageConfigForTests({ root, maxBytes: 1024 * 1024 });
});

afterEach(async () => {
  setStorageConfigForTests(undefined);
  await fs.rm(root, { recursive: true, force: true });
});

describe("folders", () => {
  it("lists an empty root", async () => {
    const listing = await service.listFolder("");
    expect(listing.path).toBe("");
    expect(listing.entries).toEqual([]);
  });

  it("creates nested folders and lists them", async () => {
    await service.ensureFolder("a");
    await service.ensureFolder("a/b");
    await service.ensureFolder("a/b/c");

    const rootListing = await service.listFolder("");
    expect(rootListing.entries.map((e) => e.name)).toEqual(["a"]);
    const nested = await service.listFolder("a/b");
    expect(nested.entries.map((e) => e.name)).toEqual(["c"]);
  });

  it("is idempotent for existing folders and rejects file collisions", async () => {
    await service.ensureFolder("docs");
    await expect(service.ensureFolder("docs")).resolves.toBeTruthy();
    await service.createFile("docs/a.txt", "x");
    await expect(service.ensureFolder("docs/a.txt")).rejects.toThrow(ApiError);
  });
});

describe("files", () => {
  it("creates, reads and overwrites text files", async () => {
    await service.createFile("notes.txt", "hello");
    const content = await service.readTextContent("notes.txt");
    expect(content.content).toBe("hello");
    expect(content.mime).toBe("text/plain");

    await service.writeTextContent("notes.txt", "world");
    expect((await service.readTextContent("notes.txt")).content).toBe("world");
  });

  it("rejects editing binary files", async () => {
    await service.uploadFile("", "img.png", toWebStream(Buffer.from([0x89, 0x50, 0x4e])), 3);
    await expect(service.readTextContent("img.png")).rejects.toThrow(ApiError);
  });

  it("rejects oversized content", async () => {
    await service.createFile("big.txt", "x");
    await expect(service.writeTextContent("big.txt", "y".repeat(2 * 1024 * 1024))).rejects.toThrow(ApiError);
  });

  it("returns 404 for missing entries", async () => {
    await expect(service.listFolder("nope")).rejects.toThrow(ApiError);
    await expect(service.readTextContent("nope.txt")).rejects.toThrow(ApiError);
    await expect(service.download("nope.txt")).rejects.toThrow(ApiError);
  });
});

describe("upload", () => {
  it("uploads a stream into a folder", async () => {
    await service.ensureFolder("uploads");
    const meta = await service.uploadFile("uploads", "photo.jpg", toWebStream("jpeg-data"), 9);
    expect(meta.name).toBe("photo.jpg");
    const listing = await service.listFolder("uploads");
    expect(listing.entries[0]).toMatchObject({ name: "photo.jpg", isDir: false, size: 9 });
    const target = await service.download("uploads/photo.jpg");
    expect(target.mime).toBe("image/jpeg");
    expect(target.size).toBe(9);
  });

  it("writes multi-chunk streams without changing their contents", async () => {
    const chunks = ["first-", Buffer.from("second-"), "third"];
    const expected = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    await service.uploadFile("", "chunked.txt", toChunkedWebStream(chunks), expected.length);

    expect(await fs.readFile(path.join(root, "chunked.txt"))).toEqual(expected);
  });

  it("enforces the streamed size limit even when the declared size is smaller", async () => {
    await expect(
      service.uploadFile("", "oversized.bin", toChunkedWebStream(["a".repeat(600_000), "b".repeat(500_000)]), 1),
    ).rejects.toThrow(ApiError);
    expect(await service.listFolder("")).toEqual({ path: "", entries: [] });
  });

  it("rejects oversized uploads before writing", async () => {
    await expect(
      service.uploadFile("", "huge.bin", toWebStream("z".repeat(2 * 1024 * 1024)), 2 * 1024 * 1024),
    ).rejects.toThrow(ApiError);
    expect(await service.listFolder("")).toEqual({ path: "", entries: [] });
  });

  it("rejects duplicate names", async () => {
    await service.uploadFile("", "dup.txt", toWebStream("a"), 1);
    await expect(service.uploadFile("", "dup.txt", toWebStream("b"), 1)).rejects.toThrow(ApiError);
  });

  it("rejects empty files", async () => {
    await expect(service.uploadFile("", "empty.txt", toWebStream(""), 0)).rejects.toThrow(ApiError);
  });
});

describe("rename", () => {
  it("renames a file in place", async () => {
    await service.createFile("old.txt", "x");
    const meta = await service.renameEntry("old.txt", "new.txt");
    expect(meta.name).toBe("new.txt");
    expect((await service.listFolder("")).entries.map((e) => e.name)).toEqual(["new.txt"]);
  });

  it("renames a folder with its children", async () => {
    await service.ensureFolder("docs");
    await service.createFile("docs/a.txt", "x");
    await service.renameEntry("docs", "guides");
    expect((await service.listFolder("guides")).entries.map((e) => e.name)).toEqual(["a.txt"]);
  });

  it("rejects colliding names", async () => {
    await service.createFile("a.txt", "x");
    await service.createFile("b.txt", "y");
    await expect(service.renameEntry("a.txt", "b.txt")).rejects.toThrow(ApiError);
  });
});

describe("copy", () => {
  it("copies a file to a new location", async () => {
    await service.createFile("src.txt", "payload");
    await service.copyEntry("src.txt", "docs/dst.txt");
    expect((await service.readTextContent("docs/dst.txt")).content).toBe("payload");
    expect((await service.readTextContent("src.txt")).content).toBe("payload");
  });

  it("rejects copying into itself", async () => {
    await service.ensureFolder("f");
    await expect(service.copyEntry("f", "f/sub")).rejects.toThrow(ApiError);
  });
});

describe("trash and restore", () => {
  it("moves to trash and restores with its original path", async () => {
    await service.ensureFolder("docs");
    await service.createFile("docs/report.txt", "content");

    await service.trashEntry("docs/report.txt");
    expect((await service.listFolder("docs")).entries).toEqual([]);

    const trash = await service.listTrash();
    expect(trash).toHaveLength(1);
    expect(trash[0].originalPath).toBe("docs/report.txt");

    await service.restoreEntry(trash[0].trashPath);
    expect((await service.readTextContent("docs/report.txt")).content).toBe("content");
    expect(await service.listTrash()).toEqual([]);
  });

  it("trashes a whole folder and restores it", async () => {
    await service.ensureFolder("project");
    await service.createFile("project/a.txt", "a");
    await service.trashEntry("project");

    const trash = await service.listTrash();
    await service.restoreEntry(trash[0].trashPath);
    expect((await service.listFolder("project")).entries.map((e) => e.name)).toEqual(["a.txt"]);
  });

  it("deletes forever", async () => {
    await service.createFile("gone.txt", "x");
    await service.trashEntry("gone.txt");
    const trash = await service.listTrash();
    await service.deleteForever(trash[0].trashPath);
    expect(await service.listTrash()).toEqual([]);
  });

  it("rejects restoring over an existing entry", async () => {
    await service.createFile("keep.txt", "keep");
    await service.trashEntry("keep.txt");
    await service.createFile("keep.txt", "new");
    const trash = await service.listTrash();
    await expect(service.restoreEntry(trash[0].trashPath)).rejects.toThrow(ApiError);
  });
});

describe("security hardening (public root)", () => {
  it("skips symlinks when listing so they can never leak into the UI", async () => {
    await service.createFile("real.txt", "x");
    await fs.symlink(path.join(root, "real.txt"), path.join(root, "shortcut.txt"));
    await fs.symlink("/etc/hostname", path.join(root, "outside.txt"));
    const listing = await service.listFolder("");
    expect(listing.entries.map((e) => e.name)).toEqual(["real.txt"]);
  });

  it("rejects reading or downloading through a symlink that escapes the root", async () => {
    const secret = path.join(os.tmpdir(), `secret-${Date.now()}.txt`);
    try {
      await fs.writeFile(secret, "top-secret");
      await fs.symlink(secret, path.join(root, "leak.txt"));
      await expect(service.readTextContent("leak.txt")).rejects.toThrow(ApiError);
      await expect(service.download("leak.txt")).rejects.toThrow(ApiError);
    } finally {
      await fs.rm(secret, { force: true });
    }
  });

  it("allows a symlink inside the root that stays inside it", async () => {
    await service.ensureFolder("docs");
    await service.createFile("docs/a.txt", "hello");
    await fs.symlink(path.join(root, "docs", "a.txt"), path.join(root, "alias.txt"));
    expect((await service.readTextContent("alias.txt")).content).toBe("hello");
  });

  it("rejects dot-names on create, rename and upload", async () => {
    await expect(service.createFile(".env", "x")).rejects.toThrow(ApiError);
    await expect(service.createFile("ok.txt", "x")).resolves.toBeTruthy();
    await expect(service.renameEntry("ok.txt", ".gitignore")).rejects.toThrow(ApiError);
    await expect(
      service.uploadFile("", ".htaccess", toWebStream("x"), 1),
    ).rejects.toThrow(ApiError);
  });

  it("hides the internal meta tree from listings", async () => {
    await service.createFile("visible.txt", "x");
    const listing = await service.listFolder("");
    expect(listing.entries.map((e) => e.name)).toEqual(["visible.txt"]);
  });
});
