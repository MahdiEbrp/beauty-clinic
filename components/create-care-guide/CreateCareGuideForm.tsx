"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import type { AdminCareGuide } from "@/lib/services/care-guides-types";

import IconPickerDialog from "../create-group/IconPickerDialog";
import IdentityStep from "../create-group/steps/IdentityStep";
import LocalizationStep from "../create-group/steps/LocalizationStep";
import WizardActionBar from "../create-group/WizardActionBar";
import WizardHeader from "../create-group/WizardHeader";
import { LANG_AWARE_STEPS, STEPS } from "./helpers";
import AppearanceStep from "./steps/AppearanceStep";
import ReviewStep from "./steps/ReviewStep";
import { useCreateGuideForm } from "./useCreateGuideForm";

const WIZARD_STEPS = STEPS as ReadonlyArray<{ id: number; key: string }>;

export default function CreateCareGuideForm({
  guide,
}: {
  guide?: AdminCareGuide;
}) {
  const t = useTranslations("guideWizard");
  const {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    currentContent,
    content,
    effectiveSlug,
    slugManual,
    isActive,
    displayOrder,
    iconKey,
    iconPickerOpen,
    setIconPickerOpen,
    fieldErrors,
    serverError,
    submitting,
    setLangName,
    setLangDescription,
    setSlug,
    toggleSlugMode,
    setIsActive,
    setDisplayOrder,
    handlePrimary,
    onIconSelect,
  } = useCreateGuideForm(guide);

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
        ns="guideWizard"
        steps={WIZARD_STEPS}
        backHref="/dashboard/care/manage/guides"
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <IdentityStep
            lang={lang}
            name={currentContent.name}
            onNameChange={setLangName}
            slug={effectiveSlug}
            slugManual={slugManual}
            onSlugChange={setSlug}
            onToggleSlugMode={toggleSlugMode}
            isActive={isActive}
            onToggleActive={() => setIsActive((value) => !value)}
            displayOrder={displayOrder}
            onDisplayOrderChange={setDisplayOrder}
            errors={fieldErrors}
            ns="guideWizard"
          />
        )}

        {step === 2 && (
          <AppearanceStep
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            ns="guideWizard"
          />
        )}

        {step === 3 && (
          <LocalizationStep
            lang={lang}
            name={currentContent.name}
            description={currentContent.description}
            onNameChange={setLangName}
            onDescriptionChange={setLangDescription}
            errors={fieldErrors}
            ns="guideWizard"
          />
        )}

        {step === 4 && (
          <ReviewStep
            content={content}
            slug={effectiveSlug}
            isActive={isActive}
            iconKey={iconKey}
            ns="guideWizard"
          />
        )}

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
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
        ns="guideWizard"
      />

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={onIconSelect}
        ns="guideWizard"
      />
    </div>
  );
}
