// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useAdminResourceActions } from "./use-admin-resource-actions";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("sonner", () => ({
  toast: { loading: vi.fn(() => "pending"), success: vi.fn(), error: vi.fn() },
}));

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

function setup() {
  const config = {
    namespace: "serviceGroups",
    patchRow: vi.fn<(row: { id: string }, patch: { isActive?: boolean }) => Promise<void>>().mockResolvedValue(undefined),
    deleteRow: vi.fn<(row: { id: string }) => Promise<void>>().mockResolvedValue(undefined),
  };
  const list = {
    load: vi.fn(async () => {}), debouncedSearch: "skin", status: "active" as const, page: 2,
  };
  const hook = renderHook(() => useAdminResourceActions(config, list));
  return { ...hook, config, list };
}

describe("shared admin resource actions", () => {
  it("tracks row syncing until PATCH and filtered refresh finish", async () => {
    const { result, config, list } = setup();
    let finish!: () => void;
    config.patchRow.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    let task!: Promise<void>;
    act(() => { task = result.current.runAction({ id: "row" }, { isActive: false }); });
    expect(result.current.busyId).toBe("row");
    expect(result.current.isSyncing("row")).toBe(true);
    expect(list.load).not.toHaveBeenCalled();
    await act(async () => { finish(); await task; });
    expect(config.patchRow).toHaveBeenCalledWith({ id: "row" }, { isActive: false });
    expect(list.load).toHaveBeenCalledWith({ search: "skin", status: "active", page: 2 });
    expect(result.current.busyId).toBeNull();
    expect(result.current.syncingIds.size).toBe(0);
    expect(toast.success).toHaveBeenCalledWith("serviceGroups.toast.success", { id: "pending" });
  });

  it("deletes the requested row and uses the deleted toast", async () => {
    const { result, config, list } = setup();
    await act(() => result.current.deleteRow({ id: "row" }));
    expect(config.deleteRow).toHaveBeenCalledWith({ id: "row" });
    expect(list.load).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith("serviceGroups.toast.deleted", { id: "pending" });
    expect(result.current.busyId).toBeNull();
  });

  it.each(["patch", "delete"] as const)("cleans up after a failed %s without refreshing", async (operation) => {
    const { result, config, list } = setup();
    config.patchRow.mockRejectedValue(new Error("denied"));
    config.deleteRow.mockRejectedValue(new Error("denied"));
    await act(() => operation === "patch"
      ? result.current.runAction({ id: "row" }, { isActive: true })
      : result.current.deleteRow({ id: "row" }));
    expect(list.load).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("serviceGroups.toast.error", { id: "pending" });
    expect(result.current.busyId).toBeNull();
    expect(result.current.isSyncing("row")).toBe(false);
  });
});
