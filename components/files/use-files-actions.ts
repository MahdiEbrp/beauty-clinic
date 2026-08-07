"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { filesCache } from "./files-cache";
import { joinRel } from "./helpers";
import type { ConfirmTarget, EntryMeta, TrashItem } from "./types";
import type { FilesListState } from "./use-files-list";

export interface FilesActionsState {
  busy: boolean;
  uploadOpen: boolean;
  setUploadOpen: (value: boolean) => void;
  newFolderOpen: boolean;
  setNewFolderOpen: (value: boolean) => void;
  newFileOpen: boolean;
  setNewFileOpen: (value: boolean) => void;
  renameTarget: EntryMeta | null;
  setRenameTarget: (value: EntryMeta | null) => void;
  editorTarget: EntryMeta | null;
  setEditorTarget: (value: EntryMeta | null) => void;
  confirm: ConfirmTarget | null;
  setConfirm: (value: ConfirmTarget | null) => void;
  uploadFiles: (files: File[]) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  createFile: (name: string) => Promise<void>;
  renameEntry: (entry: EntryMeta, newName: string) => Promise<void>;
  moveToTrash: (entry: EntryMeta) => Promise<void>;
  restoreEntry: (item: TrashItem) => Promise<void>;
  deleteForever: (item: TrashItem) => Promise<void>;
  downloadEntry: (entry: EntryMeta) => void;
  openEntry: (entry: EntryMeta) => void;
  saveContent: (content: string) => Promise<void>;
}

async function postJson(url: string, body: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("action_failed");
}

async function patchJson(url: string, body: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("action_failed");
}

export function useFilesActions(list: FilesListState): FilesActionsState {
  const t = useTranslations();
  const { load, path, navigateTo } = list;

  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<EntryMeta | null>(null);
  const [editorTarget, setEditorTarget] = useState<EntryMeta | null>(null);
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);
  const busyRef = useRef(false);

  /** Drops a folder and its parent from the cache so the next load refetches. */
  const invalidateCache = (rel: string) => {
    filesCache.invalidate(rel);
    const parent = rel.lastIndexOf("/");
    if (parent !== -1) filesCache.invalidate(rel.slice(0, parent));
  };

  const refetch = async (rel: string) => {
    invalidateCache(rel);
    await load();
  };

  const withBusy = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    await withBusy(async () => {
      const pendingToast = toast.loading(t("files.toast.uploaded", { count: files.length }));
      let uploaded = 0;
      for (const file of files) {
        const form = new FormData();
        form.append("folder", path);
        form.append("file", file);
        const response = await fetch("/api/v1/files/upload", {
          method: "POST",
          credentials: "include",
          body: form,
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: { code?: string };
          } | null;
          if (payload?.error?.code === "CONFLICT") {
            toast.error(t("files.uploadDialog.nameTaken", { name: file.name }), {
              id: pendingToast,
            });
          }
          continue;
        }
        uploaded += 1;
      }
      setUploadOpen(false);
      await refetch(path);
      if (uploaded > 0) {
        toast.success(t("files.toast.uploaded", { count: uploaded }), { id: pendingToast });
      } else {
        toast.error(t("files.toast.error"), { id: pendingToast });
      }
    });
  };

  const createFolder = async (name: string) => {
    await withBusy(async () => {
      await postJson("/api/v1/files/directory", { path: joinRel(path, name) });
      setNewFolderOpen(false);
      await refetch(path);
      toast.success(t("files.toast.folderCreated"));
    });
  };

  const createFile = async (name: string) => {
    await withBusy(async () => {
      await postJson("/api/v1/files/file", { path: joinRel(path, name), content: "" });
      setNewFileOpen(false);
      await refetch(path);
      toast.success(t("files.toast.fileCreated"));
    });
  };

  const renameEntry = async (entry: EntryMeta, newName: string) => {
    await withBusy(async () => {
      await patchJson("/api/v1/files/rename", {
        path: joinRel(path, entry.name),
        name: newName,
      });
      setRenameTarget(null);
      await refetch(path);
      toast.success(t("files.toast.renamed"));
    });
  };

  const moveToTrash = async (entry: EntryMeta) => {
    setConfirm(null);
    await withBusy(async () => {
      await postJson("/api/v1/files/trash", { path: joinRel(path, entry.name) });
      await refetch(path);
      toast.success(t("files.toast.trashed"));
    });
  };

  const restoreEntry = async (item: TrashItem) => {      setConfirm(null);
      await withBusy(async () => {
        await postJson("/api/v1/files/restore", { trashPath: item.trashPath });
        await refetch(item.originalPath);
        toast.success(t("files.toast.restored"));
      });
  };

  const deleteForever = async (item: TrashItem) => {
    setConfirm(null);
    await withBusy(async () => {
      const response = await fetch("/api/v1/files/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trashPath: item.trashPath }),
      });
      if (!response.ok) throw new Error("action_failed");
      await refetch("");
      toast.success(t("files.toast.deleted"));
    });
  };

  const downloadUrl = (entry: EntryMeta) => {
    const qs = new URLSearchParams({ path: joinRel(path, entry.name) });
    return `/api/v1/files/download?${qs.toString()}`;
  };

  const downloadEntry = (entry: EntryMeta) => {
    const anchor = document.createElement("a");
    anchor.href = downloadUrl(entry);
    anchor.rel = "noopener";
    anchor.click();
  };

  const openEntry = (entry: EntryMeta) => {
    if (entry.isDir) {
      navigateTo(joinRel(path, entry.name));
      return;
    }
    const url = downloadUrl(entry);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const saveContent = async (content: string) => {
    if (!editorTarget) return;
    const target = editorTarget;
    await withBusy(async () => {
      await patchJson("/api/v1/files/content", {
        path: joinRel(path, target.name),
        content,
      });
      setEditorTarget(null);
      await refetch(path);
      toast.success(t("files.toast.saved"));
    });
  };

  return {
    busy,
    uploadOpen,
    setUploadOpen,
    newFolderOpen,
    setNewFolderOpen,
    newFileOpen,
    setNewFileOpen,
    renameTarget,
    setRenameTarget,
    editorTarget,
    setEditorTarget,
    confirm,
    setConfirm,
    uploadFiles,
    createFolder,
    createFile,
    renameEntry,
    moveToTrash,
    restoreEntry,
    deleteForever,
    downloadEntry,
    openEntry,
    saveContent,
  };
}
