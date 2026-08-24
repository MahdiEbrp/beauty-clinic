"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
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
import { useAdminListContext } from "./context";

export function AdminListConfirmDialog<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, busyId, confirm, setConfirm, runAction, deleteRow, executeBulkAction } = ctx;
  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) setConfirm(null);
      }}
    >
      <AlertDialogContent closeLabel={t(`${config.namespace}.dialog.cancel`)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{ctx.confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{ctx.confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>
            {t(`${config.namespace}.dialog.cancel`)}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              const c = confirm;
              if (!c) return;
              if (c.kind === "bulk") {
                void executeBulkAction();
                return;
              }
              if (!c.row) return;
              if (c.action === "delete") {
                void deleteRow(c.row);
              } else {
                void runAction(c.row, config.statusPatch(c.action));
              }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t(`${config.namespace}.dialog.confirm`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
