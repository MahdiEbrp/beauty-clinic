"use client";

import { Check, KeyRound, Network, ShieldCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { emailKindKey } from "./email-format";
import type { EmailProviderFormState } from "./email-provider-form-types";
import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";

export function EmailProviderReview({ form }: { form: EmailProviderFormState }) {
  const t = useTranslations("emailProviderForm");
  const adminT = useTranslations("emailAdmin");

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
            value={adminT(`providerKinds.${emailKindKey(form.kind)}` as never)}
          />
          <ReviewValue
            label={t("fields.host")}
            value={form.host || t("review.notProvided")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.port")}
            value={form.port ? String(form.port) : t("review.notProvided")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.encryption")}
            value={t(`options.${form.encryption}` as never)}
          />
        </dl>
      </ReviewCard>

      <ReviewCard title={t("sections.credentials")}>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <ReviewValue
            icon={<ShieldCheck className="size-4 text-copper-strong" />}
            label={t("fields.username")}
            value={form.username || t("review.notProvided")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.password")}
            value={form.password ? t("review.secretReady") : t("review.secretHidden")}
          />
          <ReviewValue
            label={t("fields.fromEmail")}
            value={form.fromEmail || t("review.notProvided")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.fromName")}
            value={form.fromName || t("review.notProvided")}
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