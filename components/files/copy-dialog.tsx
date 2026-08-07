"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, Folder, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFiles } from "./files-context";
import type { EntryMeta } from "./types";

function CopyPicker({
  initialPath,
  targets,
}: {
  initialPath: string;
  targets: EntryMeta[];
}) {
  const t = useTranslations();
  const { busy, copySelected } = useFiles();
  const [pickPath, setPickPath] = useState(initialPath);
  const [folders, setFolders] = useState<EntryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (pickPath) qs.set("path", pickPath);
    let cancelled = false;
    fetch(`/api/v1/files?${qs.toString()}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data?: { entries?: EntryMeta[] } };
        if (!cancelled) {
          setFolders((payload.data?.entries ?? []).filter((entry) => entry.isDir));
        }
      })
      .catch(() => {
        if (!cancelled) setFolders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickPath]);

  const openFolder = (entry: EntryMeta) => {
    setLoading(true);
    setPickPath(pickPath === "" ? entry.name : `${pickPath}/${entry.name}`);
  };

  const navigate = (index: number) => {
    setLoading(true);
    const segments = pickPath === "" ? [] : pickPath.split("/");
    setPickPath(segments.slice(0, index + 1).join("/"));
  };

  const submit = () => {
    if (!busy) void copySelected(pickPath);
  };

  const segments = pickPath === "" ? [] : pickPath.split("/");

  return (
    <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-accent">
          {targets.length === 1
            ? t("files.copyDialog.title", { name: targets[0].name })
            : t("files.copyDialog.titleMany", { count: targets.length })}
        </DialogTitle>
        <DialogDescription>
          {t("files.copyDialog.description")}
        </DialogDescription>
      </DialogHeader>

      <nav
        aria-label={t("files.copyDialog.title")}
        className="flex items-center gap-1 overflow-x-auto py-1"
      >
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setPickPath("");
          }}
          aria-current={pickPath === "" ? "page" : undefined}
          className={`inline-flex min-h-9 shrink-0 items-center rounded-pill px-2 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            pickPath === ""
              ? "bg-accent/10 text-accent"
              : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
          }`}
        >
          {t("files.root")}
        </button>
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="flex shrink-0 items-center gap-1">
            <ChevronLeft className="size-4 text-content-tertiary rtl-mirror" aria-hidden="true" />
            <button
              type="button"
              onClick={() => navigate(index)}
              aria-current={index === segments.length - 1 ? "page" : undefined}
              className={`inline-flex min-h-9 max-w-28 items-center rounded-pill px-2 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                index === segments.length - 1
                  ? "bg-accent/10 text-accent"
                  : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
              }`}
            >
              <span className="truncate">{segment}</span>
            </button>
          </span>
        ))}
      </nav>

      <div className="min-h-36 overflow-y-auto rounded-control border border-border-primary bg-surface-primary">
        {loading ? (
          <div className="flex min-h-36 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
          </div>
        ) : folders.length === 0 ? (
          <p className="flex min-h-36 items-center justify-center px-4 text-center text-dash-caption text-content-tertiary">
            {t("files.emptyTitle")}
          </p>
        ) : (
          <ul className="divide-y divide-border-primary">
            {folders.map((folder) => (
              <li key={folder.name}>
                <button
                  type="button"
                  onClick={() => openFolder(folder)}
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-start text-dash-body-sm font-semibold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Folder className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{folder.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DialogFooter>
        <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
          {t("files.dialog.cancel")}
        </DialogClose>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("files.copyDialog.create")}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CopyDialog() {
  const { copyTargets, setCopyTargets, path } = useFiles();

  return (
    <Dialog
      open={copyTargets !== null}
      onOpenChange={(open) => {
        if (!open) setCopyTargets(null);
      }}
    >
      {copyTargets && (
        <CopyPicker
          key={copyTargets.map((target) => target.name).join("|")}
          initialPath={path}
          targets={copyTargets}
        />
      )}
    </Dialog>
  );
}
