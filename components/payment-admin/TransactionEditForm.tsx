"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Field, Panel, ReviewCard, ReviewLabel, inputClass } from "@/components/create-group/ui";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import type { PaymentTransactionAdmin } from "@/lib/payment/admin-types";
import type { PaymentTransactionStatus } from "@/src/db/schema";
import { Link, useRouter } from "@/src/i18n/navigation";
import { formatPaymentDate } from "./payment-format";
import { PaymentSelect } from "./PaymentSelect";

const STATUS_OPTIONS = [
  { value: "pending", label: "pending" },
  { value: "requested", label: "requested" },
  { value: "verified", label: "verified" },
  { value: "failed", label: "failed" },
  { value: "refunded", label: "refunded" },
  { value: "cancelled", label: "cancelled" },
] as const satisfies ReadonlyArray<{ value: PaymentTransactionStatus; label: string }>;

export function TransactionEditForm({ transaction }: { transaction: PaymentTransactionAdmin }) {
  const t = useTranslations("paymentTransactionForm");
  const locale = useLocale();
  const router = useRouter();
  const [description, setDescription] = useState(transaction.description ?? "");
  const [status, setStatus] = useState(transaction.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
    try {
      const res = await fetch(`${PAYMENT_API_ROUTES.transactions}/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: description.trim() || null,
          status,
        }),
      });
      const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) throw new Error(json?.error?.message ?? t("errors.server"));
      toast.success(t("toast.updated"), { id: pending });
      router.push("/dashboard/payment/transactions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.server"));
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-3">
        <Link
          href="/dashboard/payment/transactions"
          className="inline-flex min-h-11 items-center gap-1.5 text-dash-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
          {t("back")}
        </Link>
        <div className="space-y-1">
          <h1 className="text-dash-display font-bold tracking-tight text-accent">{t("editHeading")}</h1>
          <p className="max-w-2xl text-dash-body text-content-secondary">{t("editDescription")}</p>
        </div>
      </header>

      <ReviewCard title={t("sections.details")}>
        <div className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
          <ReadonlyRow label={t("fields.groupRef")} value={transaction.bookingGroupRef} ltr />
          <ReadonlyRow label={t("fields.amount")} value={`${transaction.amount} ${transaction.currency || ""}`.trim()} />
          <ReadonlyRow label={t("fields.provider")} value={transaction.providerName || t("providerNone")} />
          <ReadonlyRow label={t("fields.authority")} value={transaction.authority ?? "—"} ltr />
          <ReadonlyRow label={t("fields.refId")} value={transaction.refId ?? "—"} ltr />
          <ReadonlyRow label={t("fields.creatingDate")} value={transaction.createdAt ? formatPaymentDate(transaction.createdAt, locale) : "—"} />
        </div>
      </ReviewCard>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="tx-status" label={t("fields.status")} hint={t("hints.status")} required>
              <PaymentSelect value={status} onValueChange={(value) => setStatus(value as PaymentTransactionStatus)} options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))} placeholder={t("fields.status")} ariaLabel={t("fields.status")} />
            </Field>
            <div className="md:col-span-2">
              <Field id="tx-edit-description" label={t("fields.description")} hint={t("hints.description")}>
                <textarea id="tx-edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className={inputClass(false)} />
              </Field>
            </div>
          </div>
        </Panel>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => router.push("/dashboard/payment/transactions")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 text-dash-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {t("nav.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60 sm:px-8"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("nav.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReadonlyRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="space-y-1">
      <ReviewLabel>{label}</ReviewLabel>
      <p className={`text-dash-body-sm font-semibold text-content-primary ${ltr ? "text-start font-mono text-sm tabular-nums" : ""}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </p>
    </div>
  );
}