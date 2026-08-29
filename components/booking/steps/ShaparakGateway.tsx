"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { formatNumber } from "@/lib/services/format";

type ShaparakGatewayProps = {
  deposit: number;
  currency: string;
};

/** Official Shaparak gateway informational panel (Template Step4 parity).
 *  The شاپرک brand mark keeps its brand panel colour as an explicit exception. */
export default function ShaparakGateway({ deposit, currency }: ShaparakGatewayProps) {
  const t = useTranslations("booking");

  return (
    <div className="space-y-3.5 rounded-panel border-2 border-copper bg-surface-secondary p-4 shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-[#530916] text-xs font-black text-white shadow-elevation-1">
            شاپرک
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-content-primary sm:text-base">{t("review.shaparakName")}</h3>
            <p className="text-[11px] text-content-secondary">{t("review.shaparakSub")}</p>
          </div>
        </div>

        <span className="rounded-control border border-copper/40 bg-surface-tertiary px-2.5 py-1 text-[10px] font-black text-copper-deep">
          {t("review.instantVerify")}
        </span>
      </div>

      <div className="space-y-2.5 rounded-control border border-border-interactive bg-surface-primary p-3.5 text-xs">
        <div className="flex items-center justify-between gap-3 font-bold text-content-primary">
          <span>{t("review.securityLabel")}</span>
          <span className="flex items-center gap-1 font-extrabold text-copper-deep">
            <Lock className="size-3.5" aria-hidden="true" />
            {t("review.securityValue")}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 font-bold text-content-primary">
          <span>{t("review.depositPayable")}</span>
          <span className="text-sm font-black text-accent">
            {formatNumber(deposit)} {currency}
          </span>
        </div>

        <div className="border-t border-border-primary pt-2 text-[11px] leading-relaxed text-content-secondary">
          {t("review.shaparakNote")}
        </div>
      </div>
    </div>
  );
}
