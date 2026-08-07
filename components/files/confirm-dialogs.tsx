"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFiles } from "./files-context";

export function FilesConfirmDialogs() {
  const t = useTranslations();
  const { confirm, setConfirm, busy, moveToTrash, deleteForever, trashSelected } = useFiles();

  const target = confirm?.kind === "trash" ? confirm.entry : null;
  const item = confirm?.kind === "deleteForever" ? confirm.item : null;
  const title =
    confirm?.kind === "trash"
      ? t("files.trashDialog.title", { name: confirm.entry.name })
      : confirm?.kind === "trashMany"
        ? t("files.bulkTrashDialog.title", { count: confirm.entries.length })
        : confirm?.kind === "deleteForever"
          ? t("files.deleteDialog.title", { name: confirm.item.originalPath.split("/").pop() ?? "" })
          : "";
  const description =
    confirm?.kind === "trash"
      ? t("files.trashDialog.description")
      : confirm?.kind === "trashMany"
        ? t("files.bulkTrashDialog.description")
        : t("files.deleteDialog.description");

  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) setConfirm(null);
      }}
    >
      <AlertDialogContent closeLabel={t("files.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>
            {t("files.dialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              if (confirm?.kind === "trash" && target) void moveToTrash(target);
              else if (confirm?.kind === "trashMany") {
                setConfirm(null);
                void trashSelected();
              } else if (confirm?.kind === "deleteForever" && item) {
                void deleteForever(item);
              }
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("files.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
