/* eslint-disable security/detect-non-literal-fs-filename -- tests operate on dynamic temp directories by design */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as fss from "@/lib/storage/fs";

let root = "";

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "fss-"));
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("exists / isDirectory / isFile", () => {
  it("reports on files and directories", async () => {
    await fss.mkdirRecursive(path.join(root, "dir"));
    await fss.writeFile(path.join(root, "a.txt"), Buffer.from("x"));
    expect(await fss.exists(path.join(root, "dir"))).toBe(true);
    expect(await fss.isDirectory(path.join(root, "dir"))).toBe(true);
    expect(await fss.isFile(path.join(root, "dir"))).toBe(false);
    expect(await fss.isFile(path.join(root, "a.txt"))).toBe(true);
    expect(await fss.exists(path.join(root, "missing"))).toBe(false);
  });

  it("rejects empty or absurdly long paths", async () => {
    await expect(fss.exists("")).rejects.toThrow(RangeError);
    await expect(fss.isFile("x".repeat(5000))).rejects.toThrow(RangeError);
  });
});

describe("listDir", () => {
  it("returns entries with symlink flags", async () => {
    await fss.mkdirRecursive(path.join(root, "d"));
    await fss.writeFile(path.join(root, "f.txt"), Buffer.from("x"));
    await fs.symlink(path.join(root, "f.txt"), path.join(root, "link.txt"));

    const entries = await fss.listDir(root);
    const byName = Object.fromEntries(entries.map((e) => [e.name, e]));
    expect(byName["d"]).toMatchObject({ isDir: true, isSymlink: false });
    expect(byName["f.txt"]).toMatchObject({ isDir: false, isSymlink: false, size: 1 });
    expect(byName["link.txt"]).toMatchObject({ isDir: false, isSymlink: true });
  });

  it("reports defaults for broken symlinks instead of throwing", async () => {
    await fs.symlink(path.join(root, "gone.txt"), path.join(root, "broken.txt"));
    const entries = await fss.listDir(root);
    expect(entries[0]).toMatchObject({ name: "broken.txt", isSymlink: true, size: 0 });
  });
});

describe("write / read / rename / copy / remove", () => {
  it("round-trips a file", async () => {
    const file = path.join(root, "notes.txt");
    await fss.writeFile(file, Buffer.from("hello"));
    expect((await fss.readFile(file)).toString()).toBe("hello");
  });

  it("renames entries", async () => {
    const from = path.join(root, "a.txt");
    const to = path.join(root, "b.txt");
    await fss.writeFile(from, Buffer.from("x"));
    await fss.renameEntry(from, to);
    expect(await fss.exists(from)).toBe(false);
    expect(await fss.exists(to)).toBe(true);
  });

  it("copies directories recursively and refuses to overwrite", async () => {
    await fss.writeFile(path.join(root, "f.txt"), Buffer.from("x"));
    await fss.copyEntry(path.join(root, "f.txt"), path.join(root, "copied.txt"));
    expect(await fss.exists(path.join(root, "copied.txt"))).toBe(true);
    await expect(
      fss.copyEntry(path.join(root, "f.txt"), path.join(root, "copied.txt")),
    ).rejects.toThrow();
  });

  it("removes entries recursively", async () => {
    await fss.mkdirRecursive(path.join(root, "d", "nested"));
    await fss.writeFile(path.join(root, "d", "nested", "f.txt"), Buffer.from("x"));
    await fss.removeEntry(path.join(root, "d"), true);
    expect(await fss.exists(path.join(root, "d"))).toBe(false);
  });
});

describe("createTempDir", () => {
  it("creates a unique temp directory under a hidden .tmp folder", async () => {
    const first = await fss.createTempDir(root);
    const second = await fss.createTempDir(root);
    expect(first).not.toBe(second);
    expect(first.startsWith(path.join(root, ".tmp"))).toBe(true);
    expect(await fss.isDirectory(first)).toBe(true);
    expect(await fss.isDirectory(second)).toBe(true);
  });
});