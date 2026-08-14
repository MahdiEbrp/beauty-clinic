"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import type { AdminService } from "@/lib/services/types";
import WizardActionBar from "../create-group/WizardActionBar";
import WizardHeader from "../create-group/WizardHeader";
import SeoStep from "../create-group/steps/SeoStep";
import { SERVICE_STEPS } from "./helpers";
import CategoryStep from "./steps/CategoryStep";
import IdentityStep from "./steps/IdentityStep";
import PricingStep from "./steps/PricingStep";
import AppearanceStep from "./steps/AppearanceStep";
import LocalizationStep from "./steps/LocalizationStep";
import ReviewStep from "./steps/ReviewStep";
import type { CategoryOption } from "./types";
import { useCreateServiceForm } from "./useCreateServiceForm";

const WIZARD_STEPS = SERVICE_STEPS as ReadonlyArray<{ id: number; key: string }>;

export default function CreateServiceServiceForm({
  service,
  categoryOptions = [],
}: {
  service?: AdminService;
  categoryOptions?: CategoryOption[];
}) {
  const t = useTranslations("serviceWizard");
  const f = useCreateServiceForm(service, categoryOptions);

  const isLangAware = new Set([2, 5, 6]).has(f.step);
  const heading = f.mode === "edit" ? t("editHeading") : t("heading");
  const subtitle = f.mode === "edit" ? t("editSubtitle") : t("subtitle");
  const submitLabel = f.mode === "edit" ? t("nav.save") : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={f.step}
        currentStepKey={f.currentStepKey}
        total={SERVICE_STEPS.length}
        lang={f.lang}
        langAware={isLangAware}
        heading={heading}
        subtitle={subtitle}
        onLangChange={f.setLang}
        onGoTo={f.goTo}
        ns="serviceWizard"
        steps={WIZARD_STEPS}
        backHref="/dashboard/services/manage/services"
      />

      <div aria-live="polite" className="space-y-6">
        {f.step === 1 && (
          <CategoryStep
            categoryOptions={categoryOptions}
            selectedCategoryId={f.categoryId}
            onSelect={f.setCategoryId}
            errors={f.fieldErrors}
          />
        )}

        {f.step === 2 && (
          <IdentityStep
            lang={f.lang}
            title={f.currentContent.title}
            onTitleChange={f.setLangTitle}
            slug={f.effectiveSlug}
            slugManual={f.slugManual}
            onSlugChange={f.setSlug}
            onToggleSlugMode={f.toggleSlugMode}
            isActive={f.isActive}
            onToggleActive={() => f.setIsActive((v: boolean) => !v)}
            displayOrder={f.displayOrder}
            onDisplayOrderChange={f.setDisplayOrder}
            errors={f.fieldErrors}
            ns="serviceWizard"
          />
        )}

        {f.step === 3 && (
          <PricingStep
            price={f.price}
            priceError={f.priceError}
            onPriceChange={f.setPrice}
            priceType={f.priceType}
            onPriceTypeChange={f.setPriceType}
            durationMin={f.durationMin}
            onDurationMinChange={f.setDurationMin}
            sessionsCount={f.sessionsCount}
            onSessionsCountChange={f.setSessionsCount}
            isFeatured={f.isFeatured}
            onToggleFeatured={() => f.setIsFeatured((v: boolean) => !v)}
          />
        )}
              {f.step === 4 && (
          <AppearanceStep
            imageUrl={f.coverImage}
            onImageUrlChange={f.setCoverImage}
            ns="serviceWizard"
          />
        )}

        {f.step === 5 && (
          <LocalizationStep
            lang={f.lang}
            title={f.currentContent.title}
            shortDesc={f.currentContent.shortDesc}
            fullDesc={f.currentContent.fullDesc}
            onTitleChange={f.setLangTitle}
            onShortDescChange={f.setLangShortDesc}
            onFullDescChange={f.setLangFullDesc}
            errors={f.fieldErrors}
            ns="serviceWizard"
          />
        )}

        {f.step === 6 && (
          <SeoStep
            lang={f.lang}
            title={f.currentSeo.title}
            description={f.currentSeo.description}
            onTitleChange={f.setSeoTitle}
            onDescriptionChange={f.setSeoDescription}
            slug={f.effectiveSlug}
            faIncomplete={f.seoFaIncomplete}
            ns="serviceWizard"
          />
        )}

        {f.step === 7 && (
          <ReviewStep
            content={f.content}
            slug={f.effectiveSlug}
            isActive={f.isActive}
            isFeatured={f.isFeatured}
            price={f.price}
            priceType={f.priceType}
            durationMin={f.durationMin}
            sessionsCount={f.sessionsCount}
            coverImage={f.coverImage}
            extraSummary={{
              label: t("review.category"),
              value: f.selectedCategory?.name ?? "",
            }}
            ns="serviceWizard"
          />
        )}

        {f.serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-control border border-error/30 bg-error/10 p-3.5 text-dash-body-sm text-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{f.serverError}</span>
          </div>
        )}
      </div>

      <WizardActionBar
        step={f.step}
        total={SERVICE_STEPS.length}
        submitting={f.submitting}
        submitLabel={submitLabel}
        onBack={() => f.goTo(f.step - 1)}
        onPrimary={f.handlePrimary}
        ns="serviceWizard"
      />
    </div>
  );
}
