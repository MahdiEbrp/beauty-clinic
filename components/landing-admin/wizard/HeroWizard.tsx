"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import IconPickerDialog from "@/components/create-group/IconPickerDialog";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import type { AdminHero } from "@/lib/landing/admin/types";
import { IconField, ImageUrlField } from "../forms/fields";
import { HERO_LANG_AWARE_STEPS, HERO_STEPS, useHeroWizard } from "./use-hero-wizard";
import HeroContentStep from "./steps/HeroContentStep";
import HeroReviewStep from "./steps/HeroReviewStep";

function HeroAppearanceStep({
  iconKey,
  onOpenIconPicker,
  imageUrl,
  onImageUrlChange,
}: {
  iconKey: string;
  onOpenIconPicker: () => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <IconField iconKey={iconKey} onOpenPicker={onOpenIconPicker} />
      <ImageUrlField value={imageUrl} onChange={onImageUrlChange} />
    </div>
  );
}

export default function HeroWizard({ hero }: { hero: AdminHero }) {
  const t = useTranslations("landingForm");
  const {
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    content,
    fieldErrors,
    serverError,
    submitting,
    setLangField,
    iconKey,
    imageUrl,
    setImageUrl,
    iconPickerOpen,
    setIconPickerOpen,
    handlePrimary,
    onIconSelect,
    backHref,
  } = useHeroWizard({ hero });

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={currentStepKey}
        total={HERO_STEPS.length}
        lang={lang}
        langAware={HERO_LANG_AWARE_STEPS.has(step)}
        heading={t("editHeading")}
        subtitle={t("editSubtitle")}
        onLangChange={setLang}
        onGoTo={goTo}
        ns="landingForm"
        steps={HERO_STEPS}
        backHref={backHref}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <HeroContentStep
            lang={lang}
            content={content}
            errors={fieldErrors}
            onChange={setLangField}
          />
        )}
        {step === 2 && (
          <HeroAppearanceStep
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
          />
        )}
        {step === 3 && <HeroReviewStep content={content} iconKey={iconKey} imageUrl={imageUrl} />}

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

      <WizardActionBar
        step={step}
        total={HERO_STEPS.length}
        submitting={submitting}
        submitLabel={t("nav.save")}
        onBack={() => goTo(step - 1)}
        onPrimary={handlePrimary}
        ns="landingForm"
      />

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={onIconSelect}
        ns="groupWizard"
      />
    </div>
  );
}