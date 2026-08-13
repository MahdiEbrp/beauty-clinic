"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import type { AdminServiceCategory } from "@/lib/services/types";

import WizardActionBar from "../create-group/WizardActionBar";
import WizardHeader from "../create-group/WizardHeader";
import AppearanceStep from "../create-group/steps/AppearanceStep";
import IdentityStep from "../create-group/steps/IdentityStep";
import LocalizationStep from "../create-group/steps/LocalizationStep";
import ReviewStep from "../create-group/steps/ReviewStep";
import SeoStep from "../create-group/steps/SeoStep";
import IconPickerDialog from "../create-group/IconPickerDialog";
import { CATEGORY_LANG_AWARE_STEPS, CATEGORY_STEPS } from "./helpers";
import GroupStep from "./steps/GroupStep";
import type { GroupOption } from "./types";
import { useCreateCategoryForm } from "./useCreateCategoryForm";

const WIZARD_STEPS = CATEGORY_STEPS as ReadonlyArray<{ id: number; key: string }>;

export default function CreateServiceCategoryForm({
  category,
  groupOptions = [],
}: {
  category?: AdminServiceCategory;
  groupOptions?: GroupOption[];
}) {
  const t = useTranslations("categoryWizard");
  const {
    mode,
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
    groupOptions: options,
    groupId,
    setGroupId,
    selectedGroupName,
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
  } = useCreateCategoryForm(category, groupOptions);

  const isLangAware = CATEGORY_LANG_AWARE_STEPS.has(step);
  const heading = mode === "edit" ? t("editHeading") : t("heading");
  const subtitle = mode === "edit" ? t("editSubtitle") : t("subtitle");
  const submitLabel = mode === "edit" ? t("nav.save") : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={currentStepKey}
        total={CATEGORY_STEPS.length}
        lang={lang}
        langAware={isLangAware}
        heading={heading}
        subtitle={subtitle}
        onLangChange={setLang}
        onGoTo={goTo}
        ns="categoryWizard"
        steps={WIZARD_STEPS}
        backHref="/dashboard/services/manage/categories"
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <GroupStep
            groupOptions={options}
            selectedGroupId={groupId}
            onSelect={setGroupId}
            errors={fieldErrors}
          />
        )}

        {step === 2 && (
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
            ns="categoryWizard"
          />
        )}

        {step === 3 && (
          <AppearanceStep
            iconKey={iconKey}
            onOpenIconPicker={() => setIconPickerOpen(true)}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            ns="categoryWizard"
          />
        )}

        {step === 4 && (
          <LocalizationStep
            lang={lang}
            name={currentContent.name}
            description={currentContent.description}
            onNameChange={setLangName}
            onDescriptionChange={setLangDescription}
            errors={fieldErrors}
            ns="categoryWizard"
          />
        )}

        {step === 5 && (
          <SeoStep
            lang={lang}
            title={currentSeo.title}
            description={currentSeo.description}
            onTitleChange={setSeoTitle}
            onDescriptionChange={setSeoDescription}
            slug={effectiveSlug}
            faIncomplete={seoFaIncomplete}
            ns="categoryWizard"
          />
        )}

        {step === 6 && (
          <ReviewStep
            content={content}
            seo={seo}
            slug={effectiveSlug}
            isActive={isActive}
            iconKey={iconKey}
            imageUrl={imageUrl}
            ns="categoryWizard"
            extraSummary={{
              label: t("review.group"),
              value: selectedGroupName,
            }}
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
        total={CATEGORY_STEPS.length}
        submitting={submitting}
        submitLabel={submitLabel}
        onBack={() => goTo(step - 1)}
        onPrimary={handlePrimary}
        ns="categoryWizard"
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
