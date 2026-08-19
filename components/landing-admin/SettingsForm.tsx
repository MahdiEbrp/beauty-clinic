"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/services/types";
import type { AdminLandingSettings } from "@/lib/landing/admin/types";
import { Field, inputClass, Panel } from "@/components/create-group/ui";
import { FormHeader, LangTabs, LocalizedPanel, SubmitBar } from "./forms/fields";

type SeoContent = {
  seoTitle: string;
  seoDescription: string;
};

type SectionContent = {
  heading: string;
  description: string;
};

const SECTION_KEYS = ["services", "about", "gallery", "contact"] as const;

export default function SettingsForm({
  settings,
}: {
  settings: AdminLandingSettings;
}) {
  const t = useTranslations("landingForm");
  const router = useRouter();
  const backHref = "/dashboard/landing";

  const [lang, setLang] = useState<Locale>("fa");
  const [seo, setSeo] = useState<Record<Locale, SeoContent>>({
    fa: {
      seoTitle: settings.seo.translations.fa.seoTitle ?? "",
      seoDescription: settings.seo.translations.fa.seoDescription ?? "",
    },
    en: {
      seoTitle: settings.seo.translations.en.seoTitle ?? "",
      seoDescription: settings.seo.translations.en.seoDescription ?? "",
    },
  });
  const [sections, setSections] = useState<
    Record<string, Record<Locale, SectionContent>>
  >(() => {
    const seed: Record<string, Record<Locale, SectionContent>> = {};
    for (const section of settings.sections) {
      seed[section.key] = {
        fa: {
          heading: section.translations.fa.heading,
          description: section.translations.fa.description ?? "",
        },
        en: {
          heading: section.translations.en.heading,
          description: section.translations.en.description ?? "",
        },
      };
    }
    return seed;
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patchSeo = (locale: Locale, patch: Partial<SeoContent>) =>
    setSeo((prev) =>
      locale === "fa"
        ? { ...prev, fa: { ...prev.fa, ...patch } }
        : { ...prev, en: { ...prev.en, ...patch } },
    );

  const patchSection = (
    key: string,
    locale: Locale,
    patch: Partial<SectionContent>,
  ) =>
    setSections((prev) => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection -- closed section key set from DB
      [key]: {
        fa: {
          heading: prev[key]?.fa.heading ?? "",
          description: prev[key]?.fa.description ?? "",
          ...(locale === "fa" ? patch : {}),
        },
        en: {
          heading: prev[key]?.en.heading ?? "",
          description: prev[key]?.en.description ?? "",
          ...(locale === "en" ? patch : {}),
        },
      },
    }));

  const handleSubmit = async () => {
    setServerError(null);
    setSubmitting(true);
    const pending = toast.loading(t("toast.saving"));
    const payload = {
      seo: {
        fa: {
          seoTitle: seo.fa.seoTitle.trim() || null,
          seoDescription: seo.fa.seoDescription.trim() || null,
        },
        en: {
          seoTitle: seo.en.seoTitle.trim() || null,
          seoDescription: seo.en.seoDescription.trim() || null,
        },
      },
      sections: settings.sections.map((section) => {
        // eslint-disable-next-line security/detect-object-injection -- closed section key set from DB
        const content = sections[section.key] ?? {
          fa: { heading: "", description: "" },
          en: { heading: "", description: "" },
        };
        return {
          key: section.key,
          translations: {
            fa: {
              heading: content.fa.heading.trim() || section.translations.fa.heading,
              description: content.fa.description.trim() || null,
            },
            en: {
              heading: content.en.heading.trim() || section.translations.en.heading,
              description: content.en.description.trim() || null,
            },
          },
        };
      }),
    };
    try {
      const response = await fetch("/api/v1/landing/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("settings_save_failed");
      toast.success(t("toast.updated"), { id: pending });
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
      <FormHeader backHref={backHref} mode="edit" />

      <div className="flex justify-end">
        <LangTabs lang={lang} onChange={setLang} />
      </div>

      <div aria-live="polite" className="space-y-6">
        <LocalizedPanel title={t("sections.seo")} lang={lang}>
          <Field
            id={`seo-title-${lang}`}
            label={t("fields.seoTitle")}
            hint={t("fields.seoTitleHint")}
          >
            <input
              id={`seo-title-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={seo[lang].seoTitle}
              onChange={(event) => patchSeo(lang, { seoTitle: event.target.value })}
              placeholder={t("fields.seoTitlePlaceholder")}
              className={inputClass(false)}
            />
          </Field>
          <Field
            id={`seo-desc-${lang}`}
            label={t("fields.seoDescription")}
            hint={t("fields.seoDescriptionHint")}
          >
            <textarea
              id={`seo-desc-${lang}`}
              dir={lang === "fa" ? "rtl" : "ltr"}
              value={seo[lang].seoDescription}
              onChange={(event) => patchSeo(lang, { seoDescription: event.target.value })}
              placeholder={t("fields.seoDescriptionPlaceholder")}
              rows={3}
              className={`${inputClass(false)} resize-y py-3`}
            />
          </Field>
        </LocalizedPanel>

        <LocalizedPanel title={t("sections.sections")} lang={lang}>
          {SECTION_KEYS.map((key) => {
            const section = sections[key] ?? {
              fa: { heading: "", description: "" },
              en: { heading: "", description: "" },
            };
            const exists = settings.sections.some((s) => s.key === key);
            return (
              <div key={key} className="grid gap-5">
                <p className="border-b border-border-primary pb-2 text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
                  {t(`sections.sectionKeys.${key}`)}
                </p>
                <Field
                  id={`section-heading-${key}-${lang}`}
                  label={t("fields.heading")}
                  hint={exists ? undefined : t("fields.headingMissingHint")}
                >
                  <input
                    id={`section-heading-${key}-${lang}`}
                    dir={lang === "fa" ? "rtl" : "ltr"}
                    value={section[lang].heading}
                    onChange={(event) =>
                      patchSection(key, lang, { heading: event.target.value })
                    }
                    placeholder={t("fields.headingPlaceholder")}
                    className={inputClass(false)}
                  />
                </Field>
                <Field
                  id={`section-desc-${key}-${lang}`}
                  label={t("fields.description")}
                  hint={t("fields.descriptionHint")}
                >
                  <textarea
                    id={`section-desc-${key}-${lang}`}
                    dir={lang === "fa" ? "rtl" : "ltr"}
                    value={section[lang].description}
                    onChange={(event) =>
                      patchSection(key, lang, { description: event.target.value })
                    }
                    placeholder={t("fields.descriptionPlaceholder")}
                    rows={2}
                    className={`${inputClass(false)} resize-y py-3`}
                  />
                </Field>
              </div>
            );
          })}
        </LocalizedPanel>

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
        mode="edit"
        submitting={submitting}
        onCancel={() => router.push(backHref)}
      />
    </form>
  );
}