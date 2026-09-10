"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type Message = { id: string };

export function useMessageDelete<T extends Message>({
  apiBase,
  successKey,
  errorKey,
  refresh,
}: {
  apiBase: string;
  successKey: string;
  errorKey: string;
  refresh: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((items: T[]) => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((m) => m.id));
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      toast.success(successKey);
      refresh();
    } catch {
      toast.error(errorKey);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, apiBase, successKey, errorKey, refresh]);

  const bulkDelete = useCallback(async (bulkSuccessKey: string, bulkPartialKey: string) => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selectedIds);
    let failed = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`${apiBase}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("delete_failed");
      } catch {
        failed++;
      }
    }
    setDeleting(false);
    setSelectedIds(new Set());
    if (failed === 0) {
      toast.success(bulkSuccessKey);
    } else {
      toast.error(bulkPartialKey);
    }
    refresh();
  }, [selectedIds, apiBase, refresh]);

  return {
    selectedIds,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleSelect,
    handleSelectAll,
    confirmDelete,
    bulkDelete,
  };
}
