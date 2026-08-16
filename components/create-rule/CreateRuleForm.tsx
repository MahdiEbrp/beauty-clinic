"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import IconPickerDialog from "@/components/create-group/IconPickerDialog";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import type { AdminRule } from "@/lib/services/rules-types";

import { LANG_AWARE_STEPS, STEPS } from "./helpers";
import AppearanceStep from "./steps/AppearanceStep";
import IdentityStep from "./steps/IdentityStep";
import LocalizationStep from "./steps/LocalizationStep";
import ReviewStep from "./steps/ReviewStep";
import { useCreateRuleForm } from "./useCreateRuleForm";

export default function CreateRuleForm({ rule }: { rule?: AdminRule }) {
  const t = useTranslations("rulesWizard");
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
    highlighted,
    displayOrder,
    iconKey,
    color,
    imageUrl,
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
    setHighlighted,
    setDisplayOrder,
    setColor,
    setImageUrl,
    handlePrimary,
    onIconSelect,
  } = useCreateRuleForm(rule);

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
        ns="rulesWizard"
        steps={STEPS}
        backHref="/dashboard/rules"
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
            highlighted={highlighted}
            onToggleHighlighted={() => setHighlighted((value) => !value)}
            displayOrder={displayOrder}
            onDisplayOrderChange={setDisplayOrder}
            errors={fieldErrors}
            ns="rulesWizard"
          />
        )}

        {step === 2 && (
          <AppearanceStep
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            color={color}
            onColorChange={setColor}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            ns="rulesWizard"
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
            ns="rulesWizard"
          />
        )}

        {step === 4 && (
          <ReviewStep
            content={content}
            slug={effectiveSlug}
            isActive={isActive}
            highlighted={highlighted}
            iconKey={iconKey}
            color={color}
            imageUrl={imageUrl}
            ns="rulesWizard"
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
        ns="rulesWizard"
      />

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={onIconSelect}
        ns="rulesWizard"
      />
    </div>
  );
}
