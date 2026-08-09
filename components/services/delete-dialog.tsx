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
import { useServices } from "./services-context";

export function DeleteTargetDialog() {
  const t = useTranslations();
  const { deleteTarget, closeDelete, confirmDelete, busyId } = useServices();

  if (!deleteTarget) return null;

  const { kind, item } = deleteTarget;
  const titleKey =
    kind === "service"
      ? "servicesCatalog.delete.serviceTitle"
      : kind === "group"
        ? "servicesCatalog.delete.groupTitle"
        : "servicesCatalog.delete.categoryTitle";
  const descriptionKey =
    kind === "service"
      ? "servicesCatalog.delete.serviceDescription"
      : kind === "group"
        ? "servicesCatalog.delete.groupDescription"
        : "servicesCatalog.delete.categoryDescription";
  const name = kind === "service" ? item.title : item.name;

  return (
    <AlertDialog open onOpenChange={(open) => !open && closeDelete()}>
      <AlertDialogContent closeLabel={t("servicesCatalog.dialog.cancel")} className="w-full max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t(titleKey, { name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(descriptionKey, { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>
            {t("servicesCatalog.dialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              void confirmDelete();
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("servicesCatalog.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
