"use client";

import { Check, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel, ReviewCard, ReviewLabel } from "@/components/create-group/ui";
import { parseSmsVariables } from "./form-utils";
import type { SmsTemplateFormState } from "./sms-template-form-types";

export function SmsTemplateReviewStep({ form }: { form: SmsTemplateFormState }) {
  const t = useTranslations("smsTemplateForm");
  const variableNames = parseSmsVariables(form.variables);

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
      <ReviewCard title={t("review.details")}>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <ReviewValue
            icon={<FileText className="size-4 text-copper-strong" />}
            label={t("fields.key")}
            value={form.key}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.type")}
            value={t(`types.${form.messageType}` as never)}
          />
          <ReviewValue
            label={t("fields.variables")}
            value={variableNames.join(", ") || t("review.none")}
            dir="ltr"
          />
          <ReviewValue
            label={t("fields.displayOrder")}
            value={form.displayOrder}
            dir="ltr"
          />
        </dl>
      </ReviewCard>
      <ReviewCard title={t("review.content")}>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <ReviewLabel>{t("fields.faName")}</ReviewLabel>
            <p className="mt-1 text-dash-body font-medium text-content-primary">
              {form.faName || t("review.notProvided")}
            </p>
          </div>
          <div dir="ltr">
            <ReviewLabel>{t("fields.enName")}</ReviewLabel>
            <p className="mt-1 text-dash-body font-medium text-content-primary">
              {form.enName || t("review.notProvided")}
            </p>
          </div>
          <div>
            <ReviewLabel>{t("fields.faContent")}</ReviewLabel>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-dash-body-sm text-content-secondary">
              {form.faContent || t("review.notProvided")}
            </p>
          </div>
          <div dir="ltr">
            <ReviewLabel>{t("fields.enContent")}</ReviewLabel>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-dash-body-sm text-content-secondary">
              {form.enContent || t("review.notProvided")}
            </p>
          </div>
        </div>
      </ReviewCard>
      <ReviewCard title={t("review.status")}>
        <div className="flex items-center gap-2 p-5 text-dash-body-sm font-medium">
          {form.isActive ? (
            <Check className="size-4 text-success" aria-hidden="true" />
          ) : (
            <X className="size-4 text-content-tertiary" aria-hidden="true" />
          )}
          <span
            className={form.isActive ? "text-success" : "text-content-secondary"}
          >
            {t(form.isActive ? "status.active" : "review.inactive")}
          </span>
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
