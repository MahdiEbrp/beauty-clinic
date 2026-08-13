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
import { useCategories } from "./categories-context";

export function CategoriesConfirmDialog() {
  const t = useTranslations();
  const {
    busyId,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteCategory,
    executeBulkAction,
  } = useCategories();

  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) setConfirm(null);
      }}
    >
      <AlertDialogContent closeLabel={t("serviceCategories.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>
            {t("serviceCategories.dialog.cancel")}
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
                void runAction(confirm.category, { isActive: false });
              } else {
                void deleteCategory(confirm.category);
              }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("serviceCategories.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
