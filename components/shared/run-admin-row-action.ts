import { toast } from "sonner";

interface RunAdminRowActionOptions {
  id: string;
  syncingMessage: string;
  successMessage: string;
  errorMessage: string;
  operation: () => Promise<void>;
  refresh: () => Promise<void>;
  setBusyId: (id: string | null) => void;
  setSyncing: (id: string, syncing: boolean) => void;
  clearConfirm: () => void;
}

/** Runs the shared pending/success/error lifecycle for a single admin-row action. */
export async function runAdminRowAction({
  id,
  syncingMessage,
  successMessage,
  errorMessage,
  operation,
  refresh,
  setBusyId,
  setSyncing,
  clearConfirm,
}: RunAdminRowActionOptions): Promise<void> {
  clearConfirm();
  setBusyId(id);
  setSyncing(id, true);
  const pendingToast = toast.loading(syncingMessage);

  try {
    await operation();
    await refresh();
    toast.success(successMessage, { id: pendingToast });
  } catch {
    toast.error(errorMessage, { id: pendingToast });
  } finally {
    setSyncing(id, false);
    setBusyId(null);
  }
}
