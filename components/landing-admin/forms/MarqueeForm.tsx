"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import IconPickerDialog from "@/components/create-group/IconPickerDialog";
import { Field, inputClass } from "@/components/create-group/ui";
import {
  FormHeader,
  IconField,
  LangTabs,
  LocalizedPanel,
  OrderActivePanel,
  SubmitBar,
} from "./fields";
import { submitItemRequest } from "./submit-item";
import type { CollectionKey } from "../types";

function isMarquee(row: AdminCollectionRow | undefined): row is Extract<AdminCollectionRow, { text: string }> {
  return row !== undefined && "text" in row;
}

export default function MarqueeForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const mode: "create" | "edit" = initial ? "edit" : "create";
  const seed = isMarquee(initial) ? initial : undefined;

  const [lang, setLang] = useState<Locale>("fa");
  const [texts, setTexts] = useState<Record<Locale, string>>({
    fa: seed?.translations.fa.text ?? "",
    en: seed?.translations.en.text ?? "",
  });
  const [iconKey, setIconKey] = useState(seed?.icon ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(
    seed ? String(seed.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = `/dashboard/landing/marquee`;

  const setLangText = (value: string) =>
    setTexts((prev) =>
      lang === "fa"
        ? { ...prev, fa: value }
        : { ...prev, en: value },
    );

  const handleSubmit = async () => {
    setServerError(null);
    if (!texts.fa.trim() || !texts.en.trim()) {
      setServerError(t("errors.bothLocalesRequired"));
      return;
    }
    setSubmitting(true);
    const pending = toast.loading(t(mode === "edit" ? "toast.saving" : "toast.creating"));
    try {
      const result = await submitItemRequest({
        collection,
        itemId: initial?.id,
        payload: {
          icon: iconKey || null,
          displayOrder: Number(displayOrder) || 0,
          isActive,
          translations: {
            fa: { text: texts.fa.trim() },
            en: { text: texts.en.trim() },
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
          <Field
            id={`marquee-text-${lang}`}
            label={t("fields.text")}
            required
          >
            <input
              id={`marquee-text-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={texts[lang]}
              onChange={(event) => setLangText(event.target.value)}
              placeholder={t("fields.textPlaceholder")}
              className={inputClass(false)}
            />
          </Field>
        </LocalizedPanel>

        <IconField
          iconKey={iconKey}
          onOpenPicker={() => setIconPickerOpen(true)}
        />

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

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={(key) => {
          setIconKey(key);
          setIconPickerOpen(false);
        }}
        ns="groupWizard"
      />
    </form>
  );
}