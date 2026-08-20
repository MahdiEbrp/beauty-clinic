"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import WizardHeader from "@/components/create-group/WizardHeader";
import type { AdminSetting } from "@/lib/settings/admin";
import { LANG_AWARE_STEPS, STEPS } from "./helpers";
import IdentityStep from "./steps/IdentityStep";
import SettingsStep from "./steps/SettingsStep";
import ValueStep from "./steps/ValueStep";
import ReviewStep from "./steps/ReviewStep";
import { useCreateSettingForm } from "./useCreateSettingForm";

export default function CreateSettingForm({ setting }: { setting?: AdminSetting }) {
  const t = useTranslations("settingWizard");
  const {
    mode,
    step,
    goTo,
    lang,
    setLang,
    currentStepKey,
    key,
    setKey,
    type,
    setType,
    stringValue,
    setStringValue,
    numberValue,
    setNumberValue,
    booleanValue,
    setBooleanValue,
    jsonValue,
    setJsonValue,
    faValue,
    enValue,
    currentValue,
    setCurrentValue,
    displayOrder,
    setDisplayOrder,
    isActive,
    setIsActive,
    fieldErrors,
    serverError,
    submitting,
    handlePrimary,
  } = useCreateSettingForm(setting);

  const isLangAware = LANG_AWARE_STEPS.has(step) && type === "localized";
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
        ns="settingWizard"
        steps={STEPS}
        backHref="/dashboard/settings"
      />

      <div aria-live="polite" className="space-y-6">
        {step === 1 && (
          <IdentityStep
            keyValue={key}
            onKeyChange={setKey}
            type={type}
            onTypeChange={setType}
            errors={fieldErrors}
            editableKey={mode === "create"}
            ns="settingWizard"
          />
        )}

        {step === 2 && (
          <ValueStep
            type={type}
            lang={lang}
            stringValue={stringValue}
            onStringChange={setStringValue}
            numberValue={numberValue}
            onNumberChange={setNumberValue}
            booleanValue={booleanValue}
            onBooleanChange={setBooleanValue}
            jsonValue={jsonValue}
            onJsonChange={setJsonValue}
            currentValue={currentValue}
            onCurrentValueChange={setCurrentValue}
            errors={fieldErrors}
            ns="settingWizard"
          />
        )}

        {step === 3 && (
          <SettingsStep
            displayOrder={displayOrder}
            onDisplayOrderChange={setDisplayOrder}
            isActive={isActive}
            onToggleActive={() => setIsActive((value) => !value)}
            errors={fieldErrors}
            ns="settingWizard"
          />
        )}

        {step === 4 && (
          <ReviewStep
            mode={mode}
            keyValue={key}
            type={type}
            stringValue={stringValue}
            numberValue={numberValue}
            booleanValue={booleanValue}
            jsonValue={jsonValue}
            faValue={faValue}
            enValue={enValue}
            displayOrder={displayOrder}
            isActive={isActive}
            ns="settingWizard"
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
        ns="settingWizard"
      />
    </div>
  );
}