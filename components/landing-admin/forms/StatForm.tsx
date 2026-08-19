"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import { Field, inputClass, Panel } from "@/components/create-group/ui";
import {
  FormHeader,
  LangTabs,
  LocalizedPanel,
  OrderActivePanel,
  SubmitBar,
} from "./fields";
import { submitItemRequest } from "./submit-item";
import type { CollectionKey } from "../types";

function isStat(row: AdminCollectionRow | undefined): row is Extract<AdminCollectionRow, { value: number }> {
  return row !== undefined && "value" in row;
}

export default function StatForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const mode: "create" | "edit" = initial ? "edit" : "create";
  const seed = isStat(initial) ? initial : undefined;

  const [lang, setLang] = useState<Locale>("fa");
  const [labels, setLabels] = useState<Record<Locale, string>>({
    fa: seed?.translations.fa.label ?? "",
    en: seed?.translations.en.label ?? "",
  });
  const [value, setValue] = useState(seed ? String(seed.value) : "");
  const [compact, setCompact] = useState(seed?.compact ?? false);
  const [plus, setPlus] = useState(seed?.plus ?? false);
  const [displayOrder, setDisplayOrder] = useState(
    seed ? String(seed.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = `/dashboard/landing/stats`;

  const setLangLabel = (next: string) =>
    setLabels((prev) =>
      lang === "fa" ? { ...prev, fa: next } : { ...prev, en: next },
    );

  const handleSubmit = async () => {
    setServerError(null);
    if (!labels.fa.trim() || !labels.en.trim()) {
      setServerError(t("errors.bothLocalesRequired"));
      return;
    }
    if (value.trim() === "" || Number.isNaN(Number(value))) {
      setServerError(t("errors.valueRequired"));
      return;
    }
    setSubmitting(true);
    const pending = toast.loading(t(mode === "edit" ? "toast.saving" : "toast.creating"));
    try {
      const result = await submitItemRequest({
        collection,
        itemId: initial?.id,
        payload: {
          value: Number(value),
          compact,
          plus,
          displayOrder: Number(displayOrder) || 0,
          isActive,
          translations: {
            fa: { label: labels.fa.trim() },
            en: { label: labels.en.trim() },
          },
        },
      });
      if (!result.ok) {
        setServerError(result.message ?? t("toast.error"));
        toast.error(t("toast.error"), { id: pending });
        return;
      }
      toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"), { id: pending });
      router.push(backHref);
      router.refresh();
    } catch {
      setServerError(t("toast.error"));
      toast.error(t("toast.error"), { id: pending });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="space-y-6 sm:space-y-8"
    >
      <FormHeader backHref={backHref} mode={mode} />

      <div className="flex justify-end">
        <LangTabs lang={lang} onChange={setLang} />
      </div>

      <div aria-live="polite" className="space-y-6">
        <LocalizedPanel title={t("sections.content")} lang={lang}>
          <Field id={`stat-label-${lang}`} label={t("fields.label")} required>
            <input
              id={`stat-label-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={labels[lang]}
              onChange={(event) => setLangLabel(event.target.value)}
              placeholder={t("fields.labelPlaceholder")}
              className={inputClass(false)}
            />
          </Field>
        </LocalizedPanel>

        <Panel>
          <div className="grid gap-6">
            <Field
              id="stat-value"
              label={t("fields.value")}
              hint={t("fields.valueHint")}
              required
            >
              <input
                id="stat-value"
                dir="ltr"
                inputMode="numeric"
                value={value}
                onChange={(event) =>
                  setValue(event.target.value.replace(/[^0-9]/g, ""))
                }
                className={inputClass(false)}
              />
            </Field>

            <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-dash-body font-semibold text-content-primary">
                  {t("fields.plus")}
                </p>
                <p className="text-dash-caption text-content-secondary">
                  {t("fields.plusHint")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={plus}
                aria-label={t("fields.plus")}
                onClick={() => setPlus((value) => !value)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  plus ? "bg-copper" : "bg-surface-tertiary"
                }`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                    plus ? "inset-e-1" : "inset-s-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-dash-body font-semibold text-content-primary">
                  {t("fields.compact")}
                </p>
                <p className="text-dash-caption text-content-secondary">
                  {t("fields.compactHint")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={compact}
                aria-label={t("fields.compact")}
                onClick={() => setCompact((value) => !value)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  compact ? "bg-accent" : "bg-surface-tertiary"
                }`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                    compact ? "inset-e-1" : "inset-s-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Panel>

        <OrderActivePanel
          displayOrder={displayOrder}
          onDisplayOrderChange={setDisplayOrder}
          isActive={isActive}
          onToggleActive={() => setIsActive((value) => !value)}
        />

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{serverError}</span>
          </div>
        )}
      </div>

      <SubmitBar
        mode={mode}
        submitting={submitting}
        onCancel={() => router.push(backHref)}
      />
    </form>
  );
}