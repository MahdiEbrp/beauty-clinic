"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import { Field, inputClass } from "@/components/create-group/ui";
import {
  FormHeader,
  ImageUrlField,
  LangTabs,
  LocalizedPanel,
  OrderActivePanel,
  SubmitBar,
} from "./fields";
import { submitItemRequest } from "./submit-item";
import type { CollectionKey } from "../types";

function isGallery(row: AdminCollectionRow | undefined): row is Extract<AdminCollectionRow, { imageUrl: string }> {
  return row !== undefined && "imageUrl" in row;
}

type LangContent = {
  caption: string;
  alt: string;
};

export default function GalleryForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const mode: "create" | "edit" = initial ? "edit" : "create";
  const seed = isGallery(initial) ? initial : undefined;

  const [lang, setLang] = useState<Locale>("fa");
  const [content, setContent] = useState<Record<Locale, LangContent>>({
    fa: {
      caption: seed?.translations.fa.caption ?? "",
      alt: seed?.translations.fa.alt ?? "",
    },
    en: {
      caption: seed?.translations.en.caption ?? "",
      alt: seed?.translations.en.alt ?? "",
    },
  });
  const [imageUrl, setImageUrl] = useState(seed?.imageUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    seed ? String(seed.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(seed?.isActive ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = `/dashboard/landing/gallery`;

  const patchContent = (locale: Locale, patch: Partial<LangContent>) =>
    setContent((prev) =>
      locale === "fa"
        ? { ...prev, fa: { ...prev.fa, ...patch } }
        : { ...prev, en: { ...prev.en, ...patch } },
    );

  const handleSubmit = async () => {
    setServerError(null);
    if (!content.fa.alt.trim() || !content.en.alt.trim()) {
      setServerError(t("errors.bothLocalesRequired"));
      return;
    }
    if (!imageUrl.trim()) {
      setServerError(t("errors.imageRequired"));
      return;
    }
    setSubmitting(true);
    const pending = toast.loading(t(mode === "edit" ? "toast.saving" : "toast.creating"));
    try {
      const result = await submitItemRequest({
        collection,
        itemId: initial?.id,
        payload: {
          imageUrl: imageUrl.trim(),
          displayOrder: Number(displayOrder) || 0,
          isActive,
          translations: {
            fa: {
              caption: content.fa.caption.trim() || null,
              alt: content.fa.alt.trim(),
            },
            en: {
              caption: content.en.caption.trim() || null,
              alt: content.en.alt.trim(),
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
          <Field id={`gallery-alt-${lang}`} label={t("fields.alt")} required>
            <input
              id={`gallery-alt-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].alt}
              onChange={(event) => patchContent(lang, { alt: event.target.value })}
              placeholder={t("fields.altPlaceholder")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id={`gallery-caption-${lang}`}
            label={t("fields.caption")}
            hint={t("fields.captionHint")}
          >
            <input
              id={`gallery-caption-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={content[lang].caption}
              onChange={(event) => patchContent(lang, { caption: event.target.value })}
              placeholder={t("fields.captionPlaceholder")}
              className={inputClass(false)}
            />
          </Field>
        </LocalizedPanel>

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
    </form>
  );
}