"use client";

import { useState } from "react";
import { Home, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

type PaymentFailureActionsProps = { retryToken: string | null };

export default function PaymentFailureActions({ retryToken }: PaymentFailureActionsProps) {
  const t = useTranslations("paymentResult");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const retry = async () => {
    if (!retryToken) return;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/public/payments/retry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: retryToken }),
      });
      if (!response.ok) throw new Error("Retry failed");
      const body = (await response.json()) as { data?: { paymentUrl?: string } };
      if (!body.data?.paymentUrl) throw new Error("Payment URL missing");
      window.location.assign(body.data.paymentUrl);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <>
      {retryToken ? (
        <button
          type="button"
          onClick={() => void retry()}
          disabled={loading}
          className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RotateCcw className="size-4 text-copper-light" aria-hidden="true" />
          {loading ? t("failure.retrying") : t("failure.retry")}
        </button>
      ) : null}
      <Link
        href="/booking"
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Home className="size-4 text-copper" aria-hidden="true" />
        {t("failure.booking")}
      </Link>
      {error ? <p role="alert" className="basis-full text-caption font-bold text-error">{t("failure.retryError")}</p> : null}
    </>
  );
}
