import type { PaymentProviderKind } from "@/src/db/schema";

export function formatPaymentDate(value: Date | string | null, locale: string): string {
  if (!value) return "";
  const dateLocale = locale === "fa" ? "fa-IR-u-nu-latn" : "en-US";
  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function providerKindKey(kind: PaymentProviderKind): string {
  return kind;
}
