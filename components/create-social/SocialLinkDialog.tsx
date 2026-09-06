"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import type { AdminSocialLink } from "@/lib/social/admin";
import { LOCALES } from "./helpers";
import IdentityStep from "./steps/IdentityStep";
import SettingsStep from "./steps/SettingsStep";
import { useCreateSocialLinkForm } from "./useCreateSocialLinkForm";
import type { Locale } from "./types";

export function SocialLinkDialog({
  link,
  onOpenChange,
  onSaved,
}: {
  link?: AdminSocialLink;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const t = useTranslations("socialWizard");
  const form = useCreateSocialLinkForm(link, onSaved, { stepCount: 2 });
  const {
    mode,
    step,
    goTo,
    lang,
    setLang,
    labelFa,
    setLabelFa,
    labelEn,
    setLabelEn,
    url,
    setUrl,
    imageUrl,
    setImageUrl,
    displayOrder,
    setDisplayOrder,
    isActive,
    setIsActive,
    fieldErrors,
    serverError,
    submitting,
    handlePrimary,
  } = form;

  const heading = mode === "edit" ? t("editHeading") : t("heading");
  const subtitle = mode === "edit" ? t("editSubtitle") : t("subtitle");
  const submitLabel = mode === "edit" ? t("nav.save") : undefined;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("meta.close")}>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label={t("language.label")}
          className="grid grid-cols-2 gap-2 rounded-pill border border-border-primary bg-surface-tertiary/60 p-1"
        >
          {LOCALES.map((item: Locale) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={lang === item}
              onClick={() => setLang(item)}
              className={`min-h-11 rounded-pill px-4 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                lang === item
                  ? "border border-copper bg-surface-secondary text-accent shadow-elevation-1"
                  : "border border-transparent text-content-secondary hover:text-accent"
              }`}
            >
              {t(`language.${item}`)}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="space-y-5">
          {step === 1 && (
            <IdentityStep
              lang={lang}
              labelFa={labelFa}
              onLabelFaChange={setLabelFa}
              labelEn={labelEn}
              onLabelEnChange={setLabelEn}
              url={url}
              onUrlChange={setUrl}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              errors={fieldErrors}
              ns="socialWizard"
            />
          )}

          {step === 2 && (
            <SettingsStep
              displayOrder={displayOrder}
              onDisplayOrderChange={setDisplayOrder}
              isActive={isActive}
              onToggleActive={() => setIsActive((value) => !value)}
              errors={fieldErrors}
              ns="socialWizard"
            />
          )}

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <WizardActionBar
            step={step}
            total={2}
            submitting={submitting}
            submitLabel={submitLabel}
            onBack={() => goTo(step - 1)}
            onPrimary={handlePrimary}
            ns="socialWizard"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}