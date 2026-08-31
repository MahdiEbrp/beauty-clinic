"use client";

import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/create-group/ui";
import { SMS_LIMITS } from "@/lib/sms/constants";
import type { SmsSendSummary } from "@/lib/sms/send-service";
import { SmsStatusBadge } from "./SmsStatusBadge";

export function SmsSendReview({
  recipientCount,
  length,
  error,
  result,
  submitting,
}: {
  recipientCount: number;
  length: { characters: number; parts: number; encoding: "gsm7" | "unicode" };
  error: string | null;
  result: SmsSendSummary | null;
  submitting: boolean;
}) {
  const t = useTranslations("smsSend");
  return (
    <Panel>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-5 text-copper-strong" aria-hidden="true" />
        <h2 className="text-dash-heading font-black text-accent">{t("summary.ready")}</h2>
      </div>
      <dl className="mt-5 grid gap-4 text-dash-body-sm">
        <SummaryItem label={t("summary.recipients")} value={String(recipientCount)} />
        <SummaryItem label={t("summary.characters")} value={String(length.characters)} />
        <SummaryItem label={t("summary.parts")} value={String(length.parts)} />
        <SummaryItem label={t("summary.encoding")} value={length.encoding === "gsm7" ? t("summary.gsm7") : t("summary.unicode")} />
      </dl>
      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-control border border-error/30 bg-error/10 p-3 text-dash-caption text-error">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="wrap-break-word">{error}</span>
        </div>
      )}
      {result && (
        <div className="mt-5 space-y-1 rounded-control border border-success/30 bg-success/10 p-3 text-dash-caption text-success">
          <p>{t("summary.sent", { sent: result.sent, total: result.total })}</p>
          {result.failed > SMS_LIMITS.emptyLength && <p>{t("summary.failed", { failed: result.failed })}</p>}
          <SmsStatusBadge status={result.status} />
        </div>
      )}
      <button type="submit" disabled={submitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />
        {submitting ? t("actions.sending") : t("actions.send")}
      </button>
    </Panel>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-primary pb-3 last:border-b-0 last:pb-0">
      <dt className="text-content-secondary">{label}</dt>
      <dd dir="ltr" className="font-bold text-accent">{value}</dd>
    </div>
  );
}
