"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminListContext } from "./context";

export function AdminListBulkResultDialog<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
  const ctx = useAdminListContext<T>();
  const { config, bulkResult, setBulkResult } = ctx;
  if (!bulkResult) return null;
  const allSucceeded = bulkResult.failures.length === 0;
  return (
    <AlertDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) setBulkResult(null);
      }}
    >
      <AlertDialogContent closeLabel={t(`${config.namespace}.dialog.cancel`)}>
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
                ? t(`${config.namespace}.bulk.resultTitle`)
                : t(`${config.namespace}.bulk.resultPartialTitle`)}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {allSucceeded
              ? t(`${config.namespace}.bulk.resultDescription`, { count: bulkResult.succeeded })
              : t(`${config.namespace}.bulk.resultPartialDescription`, {
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
            {t(`${config.namespace}.dialog.done`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
