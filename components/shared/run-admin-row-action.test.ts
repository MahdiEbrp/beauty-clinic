import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { runAdminRowAction } from "./run-admin-row-action";

vi.mock("sonner", () => ({
  toast: { loading: vi.fn(() => "pending"), success: vi.fn(), error: vi.fn() },
}));
beforeEach(() => vi.clearAllMocks());

function setup() {
  return {
    id: "row", syncingMessage: "syncing", successMessage: "saved", errorMessage: "failed",
    operation: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    refresh: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    setBusyId: vi.fn(), setSyncing: vi.fn(), clearConfirm: vi.fn(),
  };
}

describe("runAdminRowAction", () => {
  it("clears confirmation and waits for the mutation and refresh before showing success", async () => {
    const options = setup();
    await runAdminRowAction(options);
    expect(options.clearConfirm).toHaveBeenCalledOnce();
    expect(options.operation).toHaveBeenCalledOnce();
    expect(options.refresh).toHaveBeenCalledOnce();
    expect(options.operation.mock.invocationCallOrder[0]).toBeLessThan(options.refresh.mock.invocationCallOrder[0]);
    expect(options.refresh.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(toast.success).mock.invocationCallOrder[0]);
    expect(options.setSyncing.mock.calls).toEqual([["row", true], ["row", false]]);
    expect(options.setBusyId.mock.calls).toEqual([["row"], [null]]);
    expect(toast.success).toHaveBeenCalledWith("saved", { id: "pending" });
  });

  it.each(["operation", "refresh"] as const)("cleans up after %s fails", async (stage) => {
    const options = setup();
    options[stage].mockRejectedValue(new Error("failed"));
    await runAdminRowAction(options);
    if (stage === "operation") expect(options.refresh).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("failed", { id: "pending" });
    expect(options.setBusyId).toHaveBeenLastCalledWith(null);
    expect(options.setSyncing).toHaveBeenLastCalledWith("row", false);
  });
});
