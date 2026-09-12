"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PrintPaymentReceiptButton() {
  const t = useTranslations("paymentResult");

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Printer className="size-4 text-copper" aria-hidden="true" />
      {t("success.print")}
    </button>
  );
}
