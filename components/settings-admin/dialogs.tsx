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
import { useSettings } from "./settings-context";

export function SettingsDialogs() {
  const t = useTranslations();
  const { busyId, confirm, setConfirm, confirmTitle, confirmDescription, runAction, deleteSetting } =
    useSettings();

  return (
    <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null); }}>
      <AlertDialogContent closeLabel={t("settingsAdmin.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>{t("settingsAdmin.dialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busyId !== null}
            onClick={(event) => {
              event.preventDefault();
              if (!confirm) return;
              if (confirm.action === "deactivate") void runAction(confirm.setting, { isActive: false });
              else void deleteSetting(confirm.setting);
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("settingsAdmin.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}