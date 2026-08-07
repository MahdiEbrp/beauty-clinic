"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import {
  FILES_CACHE_TTL_MS,
  filesCache,
  isFresh,
} from "./files-cache";
import type { FilesSelectionState } from "./use-files-selection";
import { useFilesSelection } from "./use-files-selection";
import type { EntryMeta, FilesView, FolderListing, TrashItem } from "./types";

export interface FilesListState extends FilesSelectionState {
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
  isRefreshing: boolean;
  hasLoadFailed: boolean;
  load: () => Promise<void>;
  navigateTo: (rel: string) => void;
  navigateUp: () => void;
}

export function useFilesList(currentUser: AuthUser): FilesListState {
  const [view, setViewRaw] = useState<FilesView>("browse");
  const [path, setPathRaw] = useState("");
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const canWrite = currentUser.permissions.includes("files.write");
  const canManage = currentUser.permissions.includes("files.manage");

  const selection = useFilesSelection(entries);
  const { clearSelection } = selection;

  const clearFns = useCallback(() => clearSelection(), [clearSelection]);

  // Tracks the folder a fetch was started for, so a slow response for an older
  // folder can never overwrite the listing of the folder the user moved on to.
  const pathRef = useRef(path);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  const load = useCallback(async () => {
    if (view === "trash") {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/files/trash", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data: TrashItem[] };
        setTrashItems(payload.data);
        setHasLoadFailed(false);
      } catch {
        setHasLoadFailed(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      return;
    }

    const cached = filesCache.get(path);
    const fresh = cached !== undefined && isFresh(cached, FILES_CACHE_TTL_MS);
    if (cached) {
      // Paint instantly from cache (fresh or stale). Stale listings refetch in
      // the background behind a subtle refreshing indicator; fresh listings are
      // served straight from cache with no network round-trip at all.
      setEntries(cached.entries);
      setIsLoading(false);
      setIsRefreshing(!fresh);
    } else {
      setIsLoading(true);
      setIsRefreshing(false);
    }

    if (fresh) return;

    try {
      const qs = new URLSearchParams();
      if (path) qs.set("path", path);
      const response = await fetch(`/api/v1/files?${qs.toString()}`, {
        credentials: "include",
      });
      if (pathRef.current !== path) return;
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as { data: FolderListing };
      const next = payload.data.entries;
      filesCache.set(path, next);
      setEntries(next);
      setHasLoadFailed(false);
    } catch {
      if (pathRef.current === path && cached === undefined) setHasLoadFailed(true);
    } finally {
      if (pathRef.current === path) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [path, view]);

  // Initial load, plus a refetch whenever the folder or view changes. The
  // fetch is deferred a tick so the effect body never sets state synchronously.
  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const navigateTo = useCallback(
    (rel: string) => {
      clearFns();
      setPathRaw(rel);
    },
    [clearFns],
  );

  const navigateUp = useCallback(() => {
    clearFns();
    setPathRaw((current) => {
      const index = current.lastIndexOf("/");
      return index === -1 ? "" : current.slice(0, index);
    });
  }, [clearFns]);

  const changePath = useCallback(
    (value: string) => {
      clearFns();
      setPathRaw(value);
    },
    [clearFns],
  );

  const changeView = useCallback(
    (value: FilesView) => {
      clearFns();
      setViewRaw(value);
    },
    [clearFns],
  );

  return {
    ...selection,
    currentUser,
    canWrite,
    canManage,
    view,
    setView: changeView,
    path,
    setPath: changePath,
    entries,
    trashItems,
    isLoading,
    isRefreshing,
    hasLoadFailed,
    load,
    navigateTo,
    navigateUp,
  };
}