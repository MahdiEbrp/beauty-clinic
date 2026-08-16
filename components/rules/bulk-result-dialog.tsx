"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRules } from "./rules-context";

export function RulesBulkResultDialog() {
  const t = useTranslations();
  const { bulkResult, setBulkResult } = useRules();

  return (
    <Dialog
      open={bulkResult !== null}
      onOpenChange={(open) => {
        if (!open) setBulkResult(null);
      }}
    >
      <DialogContent closeLabel={t("dashboardRules.dialog.cancel")} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-accent">
            {t("dashboardRules.bulk.resultTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("dashboardRules.bulk.resultDescription")}
          </DialogDescription>
        </DialogHeader>
        {bulkResult && (
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-control border border-border-primary bg-surface-tertiary/40 px-3 py-2.5 text-center">
                <p className="text-dash-title font-bold text-accent">
                  {bulkResult.requested}
                </p>
                <p className="text-dash-caption text-content-tertiary">
                  {t("dashboardRules.bulk.requested", { count: bulkResult.requested })}
                </p>
              </div>
              <div className="rounded-control border border-success/30 bg-success/10 px-3 py-2.5 text-center">
                <p className="flex items-center justify-center gap-1 text-dash-title font-bold text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {bulkResult.succeeded}
                </p>
                <p className="text-dash-caption text-content-tertiary">
                  {t("dashboardRules.bulk.succeeded", { count: bulkResult.succeeded })}
                </p>
              </div>
              <div className="rounded-control border border-error/30 bg-error/10 px-3 py-2.5 text-center">
                <p className="flex items-center justify-center gap-1 text-dash-title font-bold text-error">
                  <XCircle className="size-4" aria-hidden="true" />
                  {bulkResult.failures.length}
                </p>
                <p className="text-dash-caption text-content-tertiary">
                  {t("dashboardRules.bulk.failed", { count: bulkResult.failures.length })}
                </p>
              </div>
            </div>
            {bulkResult.failures.length > 0 && (
              <p className="text-dash-body-sm text-error">
                {t("dashboardRules.bulk.failureCount", {
                  count: bulkResult.failures.length,
                })}
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
            {t("dashboardRules.dialog.close")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
