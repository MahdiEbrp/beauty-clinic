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

export function ServicesConfirmDialog() {
  const t = useTranslations();
  const {
    busyId,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteService,
    executeBulkAction,
  } = useServices();
  return (
    <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null); }}>
      <AlertDialogContent closeLabel={t("serviceServices.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>{t("serviceServices.dialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              if (!confirm) return;
              if (confirm.kind === "bulk") { void executeBulkAction(); return; }
              if (confirm.action === "deactivate") { void runAction(confirm.service, { isActive: false }); }
              else { void deleteService(confirm.service); }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("serviceServices.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
