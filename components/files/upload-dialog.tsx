"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFiles } from "./files-context";

export function UploadDialog() {
  const t = useTranslations();
  const { uploadOpen, setUploadOpen, busy, uploadFiles } = useFiles();
  const [pending, setPending] = useState<File[]>([]);

  const onDrop = (accepted: File[]) => {
    setPending((current) => {
      const seen = new Set(current.map((file) => file.name));
      return [...current, ...accepted.filter((file) => !seen.has(file.name))];
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const runUpload = () => {
    void uploadFiles(pending).then(() => setPending([]));
  };

  return (
    <Dialog
      open={uploadOpen}
      onOpenChange={(open) => {
        setUploadOpen(open);
        if (!open) setPending([]);
      }}
    >
      <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-accent">
            {t("files.uploadDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("files.uploadDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-control border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            isDragActive
              ? "border-copper bg-copper/10 text-copper-strong"
              : "border-border-interactive bg-surface-primary text-content-secondary hover:border-copper/60 hover:bg-surface-tertiary/60",
          )}
        >
          <input {...getInputProps()} aria-label={t("files.uploadDialog.title")} />
          <UploadCloud
            className="size-10 text-accent"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-dash-body font-bold text-accent">
            {isDragActive
              ? t("files.uploadDialog.drop")
              : t("files.uploadDialog.browse")}
          </p>
        </div>

        {pending.length > 0 && (
          <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-control border border-border-primary bg-surface-primary p-3">
            {pending.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between gap-2 text-dash-caption"
              >
                <span className="min-w-0 truncate font-semibold text-accent" dir="ltr">
                  {file.name}
                </span>
                <span className="shrink-0 text-content-tertiary">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
            {t("files.dialog.cancel")}
          </DialogClose>
          <button
            type="button"
            disabled={pending.length === 0 || busy}
            onClick={runUpload}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
          >
            {busy ? t("files.uploadDialog.uploading") : t("files.upload")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
