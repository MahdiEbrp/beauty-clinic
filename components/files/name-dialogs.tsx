"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
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

function NameField({
  id,
  value,
  onChange,
  placeholder,
  autoFocus,
  onSubmit,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  onSubmit: () => void;
}) {
  return (
    <input
      id={id}
      value={value}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && value.trim()) {
          event.preventDefault();
          onSubmit();
        }
      }}
      placeholder={placeholder}
      className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-4 text-dash-body text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    />
  );
}

export function NewFolderDialog() {
  const t = useTranslations();
  const { newFolderOpen, setNewFolderOpen, busy, createFolder } = useFiles();
  const [name, setName] = useState("");

  return (
    <Dialog
      open={newFolderOpen}
      onOpenChange={(open) => {
        setNewFolderOpen(open);
        if (!open) setName("");
      }}
    >
      <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-accent">
            {t("files.newFolderDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("files.newFolderDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="files-new-folder" className="grid gap-1.5 text-dash-caption font-bold text-content-secondary">
          {t("files.newFolderDialog.name")}
          <NameField
            id="files-new-folder"
            value={name}
            onChange={setName}
            placeholder={t("files.newFolderDialog.placeholder")}
            autoFocus
            onSubmit={() => void createFolder(name)}
          />
        </label>
        <DialogFooter>
          <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
            {t("files.dialog.cancel")}
          </DialogClose>
          <button
            type="button"
            disabled={!name.trim() || busy}
            onClick={() => void createFolder(name)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("files.dialog.create")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewFileDialog() {
  const t = useTranslations();
  const { newFileOpen, setNewFileOpen, busy, createFile } = useFiles();
  const [name, setName] = useState("");

  return (
    <Dialog
      open={newFileOpen}
      onOpenChange={(open) => {
        setNewFileOpen(open);
        if (!open) setName("");
      }}
    >
      <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-accent">
            {t("files.newFileDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("files.newFileDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="files-new-file" className="grid gap-1.5 text-dash-caption font-bold text-content-secondary">
          {t("files.newFileDialog.name")}
          <NameField
            id="files-new-file"
            value={name}
            onChange={setName}
            placeholder={t("files.newFileDialog.placeholder")}
            autoFocus
            onSubmit={() => void createFile(name)}
          />
        </label>
        <DialogFooter>
          <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
            {t("files.dialog.cancel")}
          </DialogClose>
          <button
            type="button"
            disabled={!name.trim() || busy}
            onClick={() => void createFile(name)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("files.dialog.create")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({ target }: { target: EntryMeta }) {
  const t = useTranslations();
  const { busy, renameEntry, setRenameTarget } = useFiles();
  const [name, setName] = useState(target.name);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === target.name || busy) return;
    void renameEntry(target, trimmed);
    setRenameTarget(null);
    setName("");
  };

  return (
    <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-accent">
          {t("files.renameDialog.title")}
        </DialogTitle>
        <DialogDescription>
          {t("files.renameDialog.description", { name: target.name })}
        </DialogDescription>
      </DialogHeader>
      <label htmlFor="files-rename" className="grid gap-1.5 text-dash-caption font-bold text-content-secondary">
        {t("files.renameDialog.name")}
        <NameField
          id="files-rename"
          value={name}
          onChange={setName}
          placeholder=""
          autoFocus
          onSubmit={submit}
        />
      </label>
      <DialogFooter>
        <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
          {t("files.dialog.cancel")}
        </DialogClose>
        <button
          type="button"
          disabled={!name.trim() || name === target.name || busy}
          onClick={submit}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("files.dialog.confirm")}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

export function RenameDialog() {
  const { renameTarget, setRenameTarget } = useFiles();

  return (
    <Dialog
      open={renameTarget !== null}
      onOpenChange={(open) => {
        if (!open) setRenameTarget(null);
      }}
    >
      {renameTarget && <RenameForm key={renameTarget.name} target={renameTarget} />}
    </Dialog>
  );
}
