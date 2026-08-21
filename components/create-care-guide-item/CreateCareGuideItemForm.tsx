"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";

import WizardActionBar from "../create-group/WizardActionBar";
import WizardHeader from "../create-group/WizardHeader";
import { LANG_AWARE_STEPS, STEPS } from "./helpers";
import type { GuideOption } from "./types";
import { useCreateGuideItemForm } from "./useCreateGuideItemForm";
import GuideStep from "./steps/GuideStep";
import IdentityStep from "./steps/IdentityStep";
import LocalizationStep from "./steps/LocalizationStep";
import ReviewStep from "./steps/ReviewStep";

const WIZARD_STEPS = STEPS as ReadonlyArray<{ id: number; key: string }>;

export default function CreateCareGuideItemForm({
  item,
  guideOptions = [],
  initialGuideId,
}: {
  item?: AdminCareGuideItem;
  guideOptions?: GuideOption[];
  initialGuideId?: string;
}) {
  const t = useTranslations("guideItemWizard");
  const {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    currentContent,
    content,
    guideId,
    setGuideId,
    selectedGuideName,
    isActive,
    setIsActive,
    highlighted,
    setHighlighted,
    displayOrder,
    setDisplayOrder,
    fieldErrors,
    serverError,
    submitting,
    setLangTitle,
    setLangDescription,
    handlePrimary,
  } = useCreateGuideItemForm(item, guideOptions, initialGuideId);

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
        ns="guideItemWizard"
        steps={WIZARD_STEPS}
        backHref="/dashboard/care/manage/items"
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <GuideStep
            guideOptions={guideOptions}
            selectedGuideId={guideId}
            onSelect={setGuideId}
            errors={fieldErrors}
          />
        )}

        {step === 2 && (
          <IdentityStep
            lang={lang}
            title={currentContent.title}
            onTitleChange={setLangTitle}
            isActive={isActive}
            onToggleActive={() => setIsActive((value) => !value)}
            highlighted={highlighted}
            onToggleHighlighted={() => setHighlighted((value) => !value)}
            displayOrder={displayOrder}
            onDisplayOrderChange={setDisplayOrder}
            errors={fieldErrors}
          />
        )}

        {step === 3 && (
          <LocalizationStep
            lang={lang}
            title={currentContent.title}
            description={currentContent.description}
            onTitleChange={setLangTitle}
            onDescriptionChange={setLangDescription}
            errors={fieldErrors}
          />
        )}

        {step === 4 && (
          <ReviewStep
            content={content}
            guideName={selectedGuideName}
            isActive={isActive}
            highlighted={highlighted}
            ns="guideItemWizard"
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
        ns="guideItemWizard"
      />
    </div>
  );
}
