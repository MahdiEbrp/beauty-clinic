"use client";

import { Check, KeyRound, Network, ShieldCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SmsProviderFormState } from "./provider-form-types";
import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";

export function SmsProviderReview({ form }: { form: SmsProviderFormState }) {
  const t = useTranslations("smsProviderForm");
  const adminT = useTranslations("smsAdmin");
  const kindKey = form.kind === "sms_ir" ? "smsIr" : form.kind;

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-pill bg-copper/15 text-copper-strong">
            <Check className="size-8" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-dash-heading font-bold tracking-tight text-content-primary">
            {t("review.title")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-dash-body-sm leading-6 text-content-secondary">
            {t("review.description")}
          </p>
        </div>
      </Panel>

      <ReviewCard title={t("review.connection")}>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <ReviewValue
            icon={<Network className="size-4 text-copper-strong" />}
            label={t("fields.name")}
            value={form.name || t("review.notProvided")}
          />
          <ReviewValue
            icon={<KeyRound className="size-4 text-copper-strong" />}
            label={t("fields.kind")}
            value={adminT(`providerKinds.${kindKey}` as never)}
          />
          <ReviewValue
            label={t("fields.apiUrl")}
            value={form.apiUrl || t("review.notProvided")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.sender")}
            value={form.sender || t("review.notProvided")}
            dir="ltr"
          />
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.security")}>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <ReviewValue
            icon={<ShieldCheck className="size-4 text-copper-strong" />}
            label={t("fields.authScheme")}
            value={t(`options.${form.authScheme === "x-api-key" ? "xApiKey" : form.authScheme}` as never)}
          />
          <ReviewValue
            label={t("fields.payloadMode")}
            value={t(`options.${form.payloadMode}` as never)}
          />
          <ReviewValue
            label={t("fields.token")}
            value={t("review.secretHidden")}
          />
          <ReviewValue
            label={t("fields.apiKey")}
            value={form.apiKey ? t("review.secretReady") : t("review.notProvided")}
          />
        </dl>
      </ReviewCard>

      <ReviewCard title={t("review.status")}>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <StatusValue active={form.isActive} label={t("status.active")} />
          <StatusValue active={form.isDefault} label={t("status.default")} />
        </div>
      </ReviewCard>
    </div>
  );
}

function ReviewValue({
  icon,
  label,
  value,
  dir,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <ReviewLabel>{label}</ReviewLabel>
        <dd
          dir={dir}
          className="mt-1 wrap-break-word text-dash-body font-medium text-content-primary"
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function StatusValue({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-dash-body-sm font-medium">
      {active ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <X className="size-4 text-content-tertiary" aria-hidden="true" />
      )}
      <span className={active ? "text-success" : "text-content-secondary"}>
        {label}
      </span>
    </div>
  );
}
