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

import { useRules } from "./rules-context";

export function RulesConfirmDialog() {
  const t = useTranslations();
  const {
    busyId,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteRule,
    executeBulkAction,
  } = useRules();
  return (
    <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null); }}>
      <AlertDialogContent closeLabel={t("dashboardRules.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>{t("dashboardRules.dialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              if (!confirm) return;
              if (confirm.kind === "bulk") { void executeBulkAction(); return; }
              if (confirm.action === "deactivate") { void runAction(confirm.rule, { isActive: false }); }
              else { void deleteRule(confirm.rule); }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("dashboardRules.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
