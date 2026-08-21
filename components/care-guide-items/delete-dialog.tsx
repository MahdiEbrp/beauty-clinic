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
import { useCareGuideItems } from "./care-guide-items-context";

export function CareGuideItemsConfirmDialog() {
  const t = useTranslations();
  const {
    busyId,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteItem,
    executeBulkAction,
  } = useCareGuideItems();

  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) setConfirm(null);
      }}
    >
      <AlertDialogContent closeLabel={t("careGuideItems.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>
            {t("careGuideItems.dialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              if (!confirm) return;
              if (confirm.kind === "bulk") {
                void executeBulkAction();
                return;
              }
              if (confirm.action === "deactivate") {
                void runAction(confirm.item, { isActive: false });
              } else {
                void deleteItem(confirm.item);
              }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("careGuideItems.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
