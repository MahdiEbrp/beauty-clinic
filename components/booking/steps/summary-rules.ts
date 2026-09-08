import type { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations>;

/** Compact clinic-policy bullets shown in the pre-gateway confirm modal. */
export function termsList(t: Translator): string[] {
  return [
    t("summary.termsArrival"),
    t("summary.termsCancel"),
    t("summary.termsDeduct"),
    t("summary.termsLate"),
  ];
}