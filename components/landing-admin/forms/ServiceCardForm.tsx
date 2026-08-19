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
  ImageUrlField,
  LangTabs,
  LocalizedPanel,
  OrderActivePanel,
  SubmitBar,
} from "./fields";
import { submitItemRequest } from "./submit-item";
import type { CollectionKey } from "../types";

function isServiceCard(row: AdminCollectionRow | undefined): row is Extract<AdminCollectionRow, { title: string }> {
  return row !== undefined && "title" in row;
}

type LangContent = {
  title: string;
  description: string;
  ctaLabel: string;
};

export default function ServiceCardForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const mode: "create" | "edit" = initial ? "edit" : "create";
  const seed = isServiceCard(initial) ? initial : undefined;

  const [lang, setLang] = useState<Locale>("fa");
  const [content, setContent] = useState<Record<Locale, LangContent>>({
    fa: {
      title: seed?.translations.fa.title ?? "",
      description: seed?.translations.fa.description ?? "",
      ctaLabel: seed?.translations.fa.ctaLabel ?? "",
    },
    en: {
      title: seed?.translations.en.title ?? "",
      description: seed?.translations.en.description ?? "",
      ctaLabel: seed?.translations.en.ctaLabel ?? "",
    },
  });
  const [iconKey, setIconKey] = useState(seed?.icon ?? "");
  const [imageUrl, setImageUrl] = useState(seed?.image ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(
    seed ? String(seed.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = `/dashboard/landing/services`;

  const patchContent = (locale: Locale, patch: Partial<LangContent>) =>
    setContent((prev) =>
      locale === "fa"
        ? { ...prev, fa: { ...prev.fa, ...patch } }
        : { ...prev, en: { ...prev.en, ...patch } },
    );

  const handleSubmit = async () => {
    setServerError(null);
    if (!content.fa.title.trim() || !content.en.title.trim()) {
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
          image: imageUrl.trim() || null,
          displayOrder: Number(displayOrder) || 0,
          isActive,
          translations: {
            fa: {
              title: content.fa.title.trim(),
              description: content.fa.description.trim() || null,
              ctaLabel: content.fa.ctaLabel.trim() || null,
            },
            en: {
              title: content.en.title.trim(),
              description: content.en.description.trim() || null,
              ctaLabel: content.en.ctaLabel.trim() || null,
            },
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
          <Field id={`card-title-${lang}`} label={t("fields.title")} required>
            <input
              id={`card-title-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].title}
              onChange={(event) => patchContent(lang, { title: event.target.value })}
              placeholder={t("fields.titlePlaceholder")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id={`card-desc-${lang}`}
            label={t("fields.description")}
            hint={t("fields.descriptionHint")}
          >
            <textarea
              id={`card-desc-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].description}
              onChange={(event) => patchContent(lang, { description: event.target.value })}
              placeholder={t("fields.descriptionPlaceholder")}
              rows={4}
              className={`${inputClass(false)} resize-y py-3`}
            />
          </Field>
          <Field
            id={`card-cta-${lang}`}
            label={t("fields.ctaLabel")}
            hint={t("fields.ctaLabelHint")}
          >
            <input
              id={`card-cta-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].ctaLabel}
              onChange={(event) => patchContent(lang, { ctaLabel: event.target.value })}
              placeholder={t("fields.ctaLabelPlaceholder")}
              className={inputClass(false)}
            />
          </Field>
        </LocalizedPanel>

        <IconField
          iconKey={iconKey}
          onOpenPicker={() => setIconPickerOpen(true)}
        />

        <ImageUrlField value={imageUrl} onChange={setImageUrl} />

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