"use client";

import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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
import { useLandingCollection } from "./landing-collection-context";

export function LandingConfirmDialog() {
  const t = useTranslations();
  const {
    busyId,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteRow,
    executeBulkAction,
  } = useLandingCollection();

  return (
    <AlertDialog
      open={confirm !== null}
      onOpenChange={(open) => {
        if (!open) setConfirm(null);
      }}
    >
      <AlertDialogContent closeLabel={t("landingAdmin.dialog.cancel")}>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busyId !== null}>
            {t("landingAdmin.dialog.cancel")}
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
                void runAction(confirm.rowId, { isActive: false });
              } else {
                void deleteRow(confirm.rowId);
              }
            }}
          >
            {busyId !== null && <Loader2 className="size-4 animate-spin" />}
            {t("landingAdmin.dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function LandingBulkResultDialog() {
  const t = useTranslations();
  const { bulkResult, setBulkResult } = useLandingCollection();

  if (!bulkResult) return null;

  const allSucceeded = bulkResult.failures.length === 0;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && setBulkResult(null)}>
      <AlertDialogContent closeLabel={t("landingAdmin.dialog.cancel")}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {allSucceeded ? (
              <CheckCircle2
                className="size-6 shrink-0 text-success"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <XCircle
                className="size-6 shrink-0 text-error"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            <AlertDialogTitle>
              {allSucceeded
                ? t("landingAdmin.bulk.resultTitle")
                : t("landingAdmin.bulk.resultPartialTitle")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {allSucceeded
              ? t("landingAdmin.bulk.resultDescription", {
                  count: bulkResult.succeeded,
                })
              : t("landingAdmin.bulk.resultPartialDescription", {
                  succeeded: bulkResult.succeeded,
                  failed: bulkResult.failures.length,
                })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!allSucceeded && bulkResult.failures.length > 0 && (
          <ul className="max-h-40 list-inside list-disc space-y-1 overflow-y-auto rounded-control bg-surface-tertiary/60 p-3 text-dash-caption text-content-secondary">
            {bulkResult.failures.map((failure) => (
              <li key={failure.id} className="truncate">
                {failure.id}
              </li>
            ))}
          </ul>
        )}
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              setBulkResult(null);
            }}
          >
            {t("landingAdmin.dialog.done")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
