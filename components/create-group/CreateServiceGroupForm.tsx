"use client";

import { AlertTriangle } from "lucide-react";

import { LANG_AWARE_STEPS, STEPS } from "./helpers";
import IconPickerDialog from "./IconPickerDialog";
import AppearanceStep from "./steps/AppearanceStep";
import IdentityStep from "./steps/IdentityStep";
import LocalizationStep from "./steps/LocalizationStep";
import ReviewStep from "./steps/ReviewStep";
import SeoStep from "./steps/SeoStep";
import { useCreateGroupForm } from "./useCreateGroupForm";
import WizardActionBar from "./WizardActionBar";
import WizardHeader from "./WizardHeader";

export default function CreateServiceGroupForm() {
  const {
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    currentContent,
    currentSeo,
    seoFaIncomplete,
    content,
    seo,
    effectiveSlug,
    slugManual,
    isActive,
    displayOrder,
    iconKey,
    imageUrl,
    iconPickerOpen,
    setIconPickerOpen,
    fieldErrors,
    serverError,
    submitting,
    setLangName,
    setLangDescription,
    setSeoTitle,
    setSeoDescription,
    setSlug,
    toggleSlugMode,
    setIsActive,
    setDisplayOrder,
    setImageUrl,
    handlePrimary,
    onIconSelect,
  } = useCreateGroupForm();

  const isLangAware = LANG_AWARE_STEPS.has(step);

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={currentStepKey}
        total={STEPS.length}
        lang={lang}
        langAware={isLangAware}
        onLangChange={setLang}
        onGoTo={goTo}
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
          />
        )}

        {step === 2 && (
          <AppearanceStep
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
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
          />
        )}

        {step === 4 && (
          <SeoStep
            lang={lang}
            title={currentSeo.title}
            description={currentSeo.description}
            onTitleChange={setSeoTitle}
            onDescriptionChange={setSeoDescription}
            slug={effectiveSlug}
            faIncomplete={seoFaIncomplete}
          />
        )}

        {step === 5 && (
          <ReviewStep
            content={content}
            seo={seo}
            slug={effectiveSlug}
            isActive={isActive}
            iconKey={iconKey}
            imageUrl={imageUrl}
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
        onBack={() => goTo(step - 1)}
        onPrimary={handlePrimary}
      />

      <IconPickerDialog
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        selected={iconKey}
        onSelect={onIconSelect}
      />
    </div>
  );
}
