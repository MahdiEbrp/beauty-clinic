"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
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
import { useSocialLinks } from "./social-context";

export function SocialLinksDialogs() {
  const t = useTranslations();
  const { busyId, confirm, setConfirm, confirmTitle, confirmDescription, runAction, deleteLink, executeBulkAction, bulkResult, setBulkResult } = useSocialLinks();

  return (
    <>
      <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null); }}>
        <AlertDialogContent closeLabel={t("socialAdmin.dialog.cancel")}>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>{t("socialAdmin.dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyId !== null}
              onClick={(event) => {
                event.preventDefault();
                if (!confirm) return;
                if (confirm.kind === "bulk") { void executeBulkAction(); return; }
                if (confirm.action === "deactivate") { void runAction(confirm.link, { isActive: false }); }
                else { void deleteLink(confirm.link); }
              }}
            >
              {busyId !== null && <Loader2 className="size-4 animate-spin" />}
              {t("socialAdmin.dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {bulkResult && (
        <AlertDialog open={true} onOpenChange={(open) => { if (!open) setBulkResult(null); }}>
          <AlertDialogContent closeLabel={t("socialAdmin.dialog.cancel")}>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                {bulkResult.failures.length === 0 ? (
                  <CheckCircle2 className="size-6 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <XCircle className="size-6 shrink-0 text-error" strokeWidth={2} aria-hidden="true" />
                )}
                <AlertDialogTitle>
                  {bulkResult.failures.length === 0
                    ? t("socialAdmin.bulk.resultTitle")
                    : t("socialAdmin.bulk.resultPartialTitle")}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                {bulkResult.failures.length === 0
                  ? t("socialAdmin.bulk.resultDescription", { count: bulkResult.succeeded })
                  : t("socialAdmin.bulk.resultPartialDescription", {
                      succeeded: bulkResult.succeeded,
                      failed: bulkResult.failures.length,
                    })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {bulkResult.failures.length > 0 && (
              <ul className="max-h-40 list-inside list-disc space-y-1 overflow-y-auto rounded-control bg-surface-tertiary/60 p-3 text-dash-caption text-content-secondary">
                {bulkResult.failures.map((failure) => (
                  <li key={failure.id} className="truncate">{failure.id}</li>
                ))}
              </ul>
            )}
            <AlertDialogFooter>
              <AlertDialogAction onClick={(event) => { event.preventDefault(); setBulkResult(null); }}>
                {t("socialAdmin.dialog.done")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}