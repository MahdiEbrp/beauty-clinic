"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Field, Panel, inputClass } from "@/components/create-group/ui";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import { Link, useRouter } from "@/src/i18n/navigation";
import { PaymentSelect } from "./PaymentSelect";

export function TransactionCreateForm({
  providerItems,
}: {
  providerItems: { id: string; name: string }[];
}) {
  const t = useTranslations("paymentTransactionForm");
  const router = useRouter();
  const [providerId, setProviderId] = useState(providerItems[0]?.id ?? "");
  const [groupRef, setGroupRef] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!/^NF-\d{5}$/.test(groupRef.trim())) {
      setError(t("errors.invalidGroupRef"));
      return false;
    }
    if (!providerId) {
      setError(t("errors.providerRequired"));
      return false;
    }
    const amountNum = Number(amount);
    if (!amount.trim() || !Number.isFinite(amountNum) || amountNum < 1000) {
      setError(t("errors.amountRequired"));
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const pending = toast.loading(t("toast.creating"));
    try {
      const res = await fetch(PAYMENT_API_ROUTES.transactions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookingGroupRef: groupRef.trim(),
          amount: Number(amount),
          description: description.trim() || undefined,
          providerId,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: { message?: string };
        data?: { paymentUrl?: string };
      } | null;
      if (!res.ok) throw new Error(json?.error?.message ?? t("errors.server"));
      toast.success(t("toast.created"), { id: pending });
      const paymentUrl = json?.data?.paymentUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else router.push("/dashboard/payment/transactions");
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
          <h1 className="text-dash-display font-bold tracking-tight text-accent">{t("addHeading")}</h1>
          <p className="max-w-2xl text-dash-body text-content-secondary">{t("addDescription")}</p>
        </div>
      </header>

      {providerItems.length === 0 ? (
        <div className="rounded-panel border border-dashed border-surface-variant/50 bg-surface-secondary p-8 text-center">
          <p className="text-dash-body text-content-secondary">{t("noProviders")}</p>
        </div>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
          <Panel>
            <div className="grid gap-5 md:grid-cols-2">
              <Field id="tx-group-ref" label={t("fields.groupRef")} hint={t("hints.groupRef")} required>
                <input id="tx-group-ref" value={groupRef} onChange={(e) => setGroupRef(e.target.value)} placeholder={t("placeholders.groupRef")} dir="ltr" className={inputClass(Boolean(error))} />
              </Field>
              <Field id="tx-amount" label={t("fields.amount")} hint={t("hints.amount")} required>
                <input id="tx-amount" type="number" min={1000} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass(Boolean(error))} />
              </Field>
              <Field id="tx-provider" label={t("fields.provider")} required>
                <PaymentSelect value={providerId} onValueChange={setProviderId} options={providerItems.map((p) => ({ value: p.id, label: p.name }))} placeholder={t("fields.provider")} ariaLabel={t("fields.provider")} />
              </Field>
              <div className="md:col-span-2">
                <Field id="tx-description" label={t("fields.description")} hint={t("hints.description")}>
                  <textarea id="tx-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className={inputClass(false)} placeholder={t("placeholders.description")} />
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
              {t("nav.create")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}