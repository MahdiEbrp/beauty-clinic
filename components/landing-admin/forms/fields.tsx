"use client";

import { useTranslations } from "next-intl";
import { Loader2, ChevronLeft, ImageIcon } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { Locale } from "@/lib/services/types";
import { inputClass, Field, Panel } from "@/components/create-group/ui";
import GroupGlyph from "@/components/create-group/GroupGlyph";

export function LangTabs({
  lang,
  onChange,
}: {
  lang: Locale;
  onChange: (value: Locale) => void;
}) {
  const t = useTranslations("landingForm");
  const options: Locale[] = ["fa", "en"];
  return (
    <div className="inline-flex items-center gap-1 rounded-pill border border-border-primary bg-surface-primary p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={lang === option}
          className={`min-h-10 rounded-pill px-4 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            lang === option
              ? "bg-accent text-content-contrast"
              : "text-content-secondary hover:bg-surface-tertiary"
          }`}
        >
          {t(`language.${option}`)}
        </button>
      ))}
    </div>
  );
}

export function LangBadge({ lang }: { lang: Locale }) {
  const t = useTranslations("landingForm");
  return (
    <span className="rounded-pill bg-copper/10 px-2.5 py-1 text-dash-caption font-bold text-copper-strong">
      {t("language.editing", { lang: t(`language.${lang}`) })}
    </span>
  );
}

export function FormHeader({
  backHref,
  mode,
}: {
  backHref: string;
  mode: "create" | "edit";
}) {
  const t = useTranslations("landingForm");
  return (
    <header className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
        <span>{t("back")}</span>
      </Link>
      <div className="space-y-1">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {mode === "edit" ? t("editHeading") : t("heading")}
        </h1>
        <p className="max-w-2xl text-dash-body text-content-secondary">
          {mode === "edit" ? t("editSubtitle") : t("subtitle")}
        </p>
      </div>
    </header>
  );
}

export function SubmitBar({
  mode,
  submitting,
  onCancel,
}: {
  mode: "create" | "edit";
  submitting: boolean;
  onCancel: () => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-panel border border-border-primary bg-surface-secondary/95 p-3 shadow-elevation-3 backdrop-blur">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="min-h-11 rounded-pill border border-border-interactive bg-surface-secondary px-5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {t("cancel")}
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {submitting ? t("saving") : t("save")}
      </button>
    </div>
  );
}

export function LocalizedPanel({
  title,
  lang,
  children,
}: {
  title: string;
  lang: Locale;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border-primary pb-4">
        <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
          {title}
        </h3>
        <LangBadge lang={lang} />
      </div>
      <div dir={lang === "fa" ? "rtl" : "ltr"} className="grid gap-5">
        {children}
      </div>
    </Panel>
  );
}

export function OrderActivePanel({
  displayOrder,
  onDisplayOrderChange,
  isActive,
  onToggleActive,
}: {
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="grid gap-6">
        <Field
          id="landing-order"
          label={t("fields.displayOrder")}
          hint={t("fields.displayOrderHint")}
        >
          <input
            id="landing-order"
            dir="ltr"
            inputMode="numeric"
            value={displayOrder}
            onChange={(event) =>
              onDisplayOrderChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            className={inputClass(false)}
          />
        </Field>
        <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-dash-body font-semibold text-content-primary">
              {t("fields.active")}
            </p>
            <p className="text-dash-caption text-content-secondary">
              {t("fields.activeHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={t("fields.active")}
            onClick={onToggleActive}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? "bg-accent" : "bg-surface-tertiary"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-pill bg-on-primary shadow-elevation-1 transition-all duration-200 ${
                isActive ? "inset-e-1" : "inset-s-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export function IconField({
  iconKey,
  onOpenPicker,
}: {
  iconKey: string;
  onOpenPicker: () => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-dash-body font-semibold text-content-primary">
            {t("fields.icon")}
          </p>
          <p className="text-dash-caption text-content-secondary">
            {t("fields.iconHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPicker}
          className="inline-flex min-h-11 items-center gap-3 rounded-control border border-border-interactive bg-surface-tertiary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-pill bg-surface-secondary text-accent">
            {iconKey ? (
              <GroupGlyph name={iconKey} className="size-4" />
            ) : (
              <ImageIcon className="size-4" aria-hidden="true" />
            )}
          </span>
          <span>{t("fields.iconChoose")}</span>
        </button>
      </div>
    </Panel>
  );
}

export function ImageUrlField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("landingForm");
  return (
    <Panel>
      <Field
        id="landing-image"
        label={t("fields.imageUrl")}
        hint={t("fields.imageUrlHint")}
      >
        <input
          id="landing-image"
          dir="ltr"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className={inputClass(false)}
        />
      </Field>
      {value && (
        <div className="mt-4">
          <p className="mb-2 text-dash-caption font-bold text-content-secondary">
            {t("fields.preview")}
          </p>
          <div className="overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/50">
            <img
              src={value}
              alt=""
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          </div>
        </div>
      )}
    </Panel>
  );
}