// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useAdminBulkExecution } from "./use-admin-bulk-execution";
import { useAdminBulk } from "./use-admin-bulk";
import type { AdminListConfig } from "./types";
import type { AdminActionsState } from "./use-admin-actions";
import type { AdminListState } from "./use-admin-list";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("sonner", () => ({
  toast: { loading: vi.fn(() => "pending"), success: vi.fn(), error: vi.fn() },
}));

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

type Confirm = { kind: "bulk"; action: string };

function setup(scope: "page" | "filtered" = "page") {
  const config = {
    namespace: "dashboardRules",
    isAvailable: vi.fn(() => true),
    isDangerous: vi.fn((action: string) => action === "delete"),
    makeConfirm: (action: string): Confirm => ({ kind: "bulk", action }),
    execute: vi.fn(() => Promise.resolve({ requested: 1, succeeded: 1, failures: [] as Array<{ id: string; code: string }> })),
  };
  const list = {
    load: vi.fn(async () => {}),
    debouncedSearch: "laser",
    status: "inactive" as const,
    page: 3,
    visibleIds: ["visible"],
    selectedIds: ["selected"],
    selectionScope: scope,
    clearSelection: vi.fn(),
    bulkAction: "activate",
  };
  const actions = { setBusyId: vi.fn(), setConfirm: vi.fn(), setSyncing: vi.fn() };
  const render = () => renderHook(() => useAdminBulkExecution(config, list, actions));
  return { config, list, actions, render };
}

describe("shared admin bulk execution", () => {
  it("executes selected IDs with current filters and cleans up after refreshing", async () => {
    const { config, list, actions, render } = setup();
    const { result } = render();
    await act(() => result.current.executeBulkAction());
    expect(config.execute).toHaveBeenCalledWith({
      action: "activate", scope: "page", ids: ["selected"],
      filters: { search: "laser", status: "inactive" },
    });
    expect(list.load).toHaveBeenCalledWith({ search: "laser", status: "inactive", page: 3 });
    expect(list.clearSelection).toHaveBeenCalledOnce();
    expect(actions.setConfirm).toHaveBeenCalledWith(null);
    expect(actions.setSyncing.mock.calls).toEqual([["selected", true], ["selected", false]]);
    expect(actions.setBusyId.mock.calls).toEqual([["bulk"], [null]]);
    expect(toast.success).toHaveBeenCalledWith("dashboardRules.toast.success", { id: "pending" });
    expect(result.current.bulkResult).toBeNull();
  });

  it("runs a filtered operation even when the current page is empty", async () => {
    const { config, list, render } = setup("filtered");
    list.visibleIds = [];
    list.selectedIds = [];
    const { result } = render();
    await act(() => result.current.executeBulkAction());
    expect(config.execute).toHaveBeenCalledWith(expect.objectContaining({ scope: "filtered", ids: [] }));
  });

  it("asks for confirmation before destructive operations", () => {
    const { config, list, actions, render } = setup();
    list.bulkAction = "delete";
    const { result } = render();
    act(() => result.current.runBulkAction());
    expect(result.current.bulkDangerous).toBe(true);
    expect(actions.setConfirm).toHaveBeenCalledWith({ kind: "bulk", action: "delete" });
    expect(config.execute).not.toHaveBeenCalled();
  });

  it("does not confirm or execute an empty page selection", async () => {
    const { config, list, actions, render } = setup();
    list.bulkAction = "delete";
    list.selectedIds = [];
    const { result } = render();
    act(() => result.current.runBulkAction());
    await act(() => result.current.executeBulkAction());
    expect(actions.setConfirm).not.toHaveBeenCalled();
    expect(config.execute).not.toHaveBeenCalled();
  });

  it("rejects unavailable actions on both entry points, including direct confirmation", async () => {
    const { config, actions, render } = setup();
    config.isAvailable.mockReturnValue(false);
    const { result } = render();
    act(() => result.current.runBulkAction());
    await act(() => result.current.executeBulkAction());
    expect(result.current.bulkDangerous).toBe(false);
    expect(config.execute).not.toHaveBeenCalled();
    expect(actions.setBusyId).not.toHaveBeenCalled();
    expect(actions.setConfirm).not.toHaveBeenCalled();
  });

  it("preserves selection on a failed request and always clears syncing state", async () => {
    const { config, list, actions, render } = setup();
    config.execute.mockRejectedValue(new Error("network"));
    const { result } = render();
    await act(() => result.current.executeBulkAction());
    expect(list.clearSelection).not.toHaveBeenCalled();
    expect(list.load).not.toHaveBeenCalled();
    expect(actions.setSyncing).toHaveBeenLastCalledWith("selected", false);
    expect(actions.setBusyId).toHaveBeenLastCalledWith(null);
    expect(toast.error).toHaveBeenCalledWith("dashboardRules.toast.error", { id: "pending" });
  });

  it("retains partial failures for the results panel", async () => {
    const { config, render } = setup();
    const partial = { requested: 2, succeeded: 1, failures: [{ id: "blocked", code: "OPERATION_FAILED" }] };
    config.execute.mockResolvedValue(partial);
    const { result } = render();
    await act(() => result.current.executeBulkAction());
    expect(result.current.bulkResult).toEqual(partial);
  });

  it("clears busy state even if refreshing fails", async () => {
    const { list, actions, render } = setup();
    list.load.mockRejectedValue(new Error("refresh"));
    const { result } = render();
    await act(() => result.current.executeBulkAction());
    expect(actions.setBusyId).toHaveBeenLastCalledWith(null);
    expect(actions.setSyncing).toHaveBeenLastCalledWith("selected", false);
    expect(toast.error).toHaveBeenCalledOnce();
  });
});

describe("generic bulk adapter", () => {
  it("preserves the configured action allowlist when executing directly", async () => {
    type Row = { id: string };
    // Only fields consumed by this adapter are needed; no UI is rendered here.
    const config = {
      namespace: "dashboardRules",
      bulkActions: [{ key: "activate", labelKey: "dashboardRules.bulk.activate" }],
      executeBulk: vi.fn(),
    } as unknown as AdminListConfig<Row>;
    const { list, actions } = setup();
    list.bulkAction = "unconfigured";
    const { result } = renderHook(() => useAdminBulk(
      config,
      list as unknown as AdminListState<Row>,
      actions as unknown as AdminActionsState<Row>,
    ));
    await act(() => result.current.executeBulkAction());
    expect(config.executeBulk).not.toHaveBeenCalled();
  });
});
