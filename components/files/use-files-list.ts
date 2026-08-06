"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { EntryMeta, FilesView, FolderListing, TrashItem } from "./types";

export interface FilesListState {
  currentUser: AuthUser;
  canWrite: boolean;
  canManage: boolean;
  view: FilesView;
  setView: (value: FilesView) => void;
  path: string;
  setPath: (value: string) => void;
  entries: EntryMeta[];
  trashItems: TrashItem[];
  isLoading: boolean;
  hasLoadFailed: boolean;
  load: () => Promise<void>;
  navigateTo: (rel: string) => void;
  navigateUp: () => void;
}

export function useFilesList(currentUser: AuthUser): FilesListState {
  const [view, setView] = useState<FilesView>("browse");
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const canWrite = currentUser.permissions.includes("files.write");
  const canManage = currentUser.permissions.includes("files.manage");

  const load = useCallback(async () => {
    if (view === "trash") {
      try {
        const response = await fetch("/api/v1/files/trash", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data: TrashItem[] };
        setTrashItems(payload.data);
      } catch {
        setHasLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    try {
      const qs = new URLSearchParams();
      if (path) qs.set("path", path);
      const response = await fetch(`/api/v1/files?${qs.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as { data: FolderListing };
      setEntries(payload.data.entries);
    } catch {
      setHasLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [path, view]);

  // Initial load, plus a refetch whenever the folder or view changes. The
  // fetch is deferred a tick so the effect body never sets state synchronously.
  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const navigateTo = useCallback((rel: string) => {
    setPath(rel);
  }, []);

  const navigateUp = useCallback(() => {
    setPath((current) => {
      const index = current.lastIndexOf("/");
      return index === -1 ? "" : current.slice(0, index);
    });
  }, []);

  return {
    currentUser,
    canWrite,
    canManage,
    view,
    setView,
    path,
    setPath,
    entries,
    trashItems,
    isLoading,
    hasLoadFailed,
    load,
    navigateTo,
    navigateUp,
  };
}