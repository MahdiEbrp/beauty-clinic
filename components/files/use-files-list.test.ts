// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/lib/auth/dal";
import { filesCache } from "./files-cache";
import { useFilesList } from "./use-files-list";

const user: AuthUser = {
  id: "user", email: "user@example.com", fullName: "User", roles: [], permissions: ["files.write"],
};
const entries = [
  { name: "Photos", isDir: true, size: 0, mtimeMs: 0 },
  { name: "photo.PNG", isDir: false, size: 1, mtimeMs: 0 },
  { name: "notes.txt", isDir: false, size: 1, mtimeMs: 0 },
];

beforeEach(() => {
  filesCache.invalidateAll();
  filesCache.set("", entries);
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ data: [] })))));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function mount() {
  const hook = renderHook(() => useFilesList(user));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("file manager filtering and selection", () => {
  it("combines trimmed case-insensitive name search with file/folder filters", async () => {
    const { result } = await mount();
    act(() => result.current.setSearchQuery("  PHOTO  "));
    expect(result.current.visibleEntries.map((entry) => entry.name)).toEqual(["Photos", "photo.PNG"]);
    act(() => result.current.setEntryType("files"));
    expect(result.current.visibleEntries.map((entry) => entry.name)).toEqual(["photo.PNG"]);
    act(() => result.current.setEntryType("folders"));
    expect(result.current.visibleEntries.map((entry) => entry.name)).toEqual(["Photos"]);
  });

  it("selects only visible entries and clears hidden selection when filters change", async () => {
    const { result } = await mount();
    act(() => result.current.selectAll());
    expect(result.current.selectedEntries).toHaveLength(3);
    act(() => result.current.setEntryType("files"));
    expect(result.current.anySelected).toBe(false);
    act(() => result.current.selectAll());
    expect(result.current.selectedEntries).toHaveLength(2);
    act(() => result.current.setSearchQuery("notes"));
    expect(result.current.selectedNames).toEqual([]);
    act(() => result.current.selectAll());
    expect(result.current.selectedEntries.map((entry) => entry.name)).toEqual(["notes.txt"]);
  });

  it("clearing filters restores the full listing without a request", async () => {
    const { result } = await mount();
    act(() => { result.current.setSearchQuery("missing"); result.current.setEntryType("folders"); });
    expect(result.current.visibleEntries).toEqual([]);
    act(() => { result.current.setSearchQuery(""); result.current.setEntryType("all"); });
    expect(result.current.visibleEntries).toEqual(entries);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("searches full original paths in trash without applying the hidden type filter", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [
      { trashPath: "a", originalPath: "Photos/Summer.JPG" },
      { trashPath: "b", originalPath: "Docs/notes.txt" },
    ] })));
    const { result } = await mount();
    act(() => { result.current.setEntryType("folders"); result.current.setView("trash"); });
    await waitFor(() => expect(result.current.trashItems).toHaveLength(2));
    act(() => result.current.setSearchQuery(" photos/ "));
    expect(result.current.visibleTrashItems.map((item) => item.trashPath)).toEqual(["a"]);
  });
});
