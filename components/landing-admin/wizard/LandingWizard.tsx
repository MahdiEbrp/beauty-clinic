"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import IconPickerDialog from "@/components/create-group/IconPickerDialog";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import { useLandingWizard } from "./use-landing-wizard";
import { LANG_AWARE_STEPS, STEPS } from "./steps";
import AppearanceStep from "./steps/AppearanceStep";
import ContentStep from "./steps/ContentStep";
import ReviewStep from "./steps/ReviewStep";
import SettingsStep from "./steps/SettingsStep";
import type { CollectionKey } from "../types";

export default function LandingWizard({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  const t = useTranslations("landingForm");
  const {
    mode,
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
    value,
    setValue,
    compact,
    toggleCompact,
    plus,
    togglePlus,
    displayOrder,
    setDisplayOrder,
    isActive,
    toggleActive,
    iconPickerOpen,
    setIconPickerOpen,
    handlePrimary,
    onIconSelect,
    backHref,
  } = useLandingWizard({ collection, initial });

  const isLangAware = LANG_AWARE_STEPS.has(step);
  const heading = mode === "edit" ? t("editHeading") : t("heading");
  const subtitle = mode === "edit" ? t("editSubtitle") : t("subtitle");
  const submitLabel = mode === "edit" ? t("nav.save") : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={currentStepKey}
        total={STEPS.length}
        lang={lang}
        langAware={isLangAware}
        heading={heading}
        subtitle={subtitle}
        onLangChange={setLang}
        onGoTo={goTo}
        ns="landingForm"
        steps={STEPS}
        backHref={backHref}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <ContentStep
            collection={collection}
            lang={lang}
            content={content}
            errors={fieldErrors}
            onChange={setLangField}
          />
        )}

        {step === 2 && (
          <AppearanceStep
            collection={collection}
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            value={value}
            onValueChange={setValue}
            plus={plus}
            onTogglePlus={togglePlus}
            compact={compact}
            onToggleCompact={toggleCompact}
            errors={fieldErrors}
          />
        )}

        {step === 3 && (
          <SettingsStep
            displayOrder={displayOrder}
            onDisplayOrderChange={setDisplayOrder}
            isActive={isActive}
            onToggleActive={toggleActive}
          />
        )}

        {step === 4 && (
          <ReviewStep
            collection={collection}
            content={content}
            iconKey={iconKey}
            imageUrl={imageUrl}
            value={value}
            plus={plus}
            compact={compact}
            displayOrder={displayOrder}
            isActive={isActive}
          />
        )}

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
        total={STEPS.length}
        submitting={submitting}
        submitLabel={submitLabel}
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