"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import type { AdminLandingSettings } from "@/lib/landing/admin/types";
import SeoStep from "./steps/SettingsSeoStep";
import SectionsStep from "./steps/SettingsSectionsStep";
import SettingsReviewStep from "./steps/SettingsReviewStep";
import {
  SETTINGS_LANG_AWARE_STEPS,
  SETTINGS_STEPS,
  useSettingsWizard,
} from "./use-settings-wizard";

export default function SettingsWizard({
  settings,
}: {
  settings: AdminLandingSettings;
}) {
  const t = useTranslations("landingForm");
  const {
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    seo,
    sections,
    serverError,
    submitting,
    setLangSeoField,
    setLangSectionField,
    handlePrimary,
    backHref,
  } = useSettingsWizard({ settings });

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader
        step={step}
        currentStepKey={currentStepKey}
        total={SETTINGS_STEPS.length}
        lang={lang}
        langAware={SETTINGS_LANG_AWARE_STEPS.has(step)}
        heading={t("editHeading")}
        subtitle={t("editSubtitle")}
        onLangChange={setLang}
        onGoTo={goTo}
        ns="landingForm"
        steps={SETTINGS_STEPS}
        backHref={backHref}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && <SeoStep lang={lang} seo={seo} onChange={setLangSeoField} />}
        {step === 2 && (
          <SectionsStep
            lang={lang}
            sections={sections}
            onChange={setLangSectionField}
          />
        )}
        {step === 3 && <SettingsReviewStep seo={seo} sections={sections} />}

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
        total={SETTINGS_STEPS.length}
        submitting={submitting}
        submitLabel={t("nav.save")}
        onBack={() => goTo(step - 1)}
        onPrimary={handlePrimary}
        ns="landingForm"
      />
    </div>
  );
}