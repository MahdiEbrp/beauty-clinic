import type { PaymentProviderKind } from "@/src/db/schema";

export type PaymentProviderOption = {
  kind: PaymentProviderKind;
  labelKey: string;
  descriptionKey: string;
  defaultApiUrl: string;
};

export const PAYMENT_PROVIDER_OPTIONS: readonly PaymentProviderOption[] = [
  {
    kind: "zarinpal",
    labelKey: "providerKinds.zarinpal",
    descriptionKey: "providerDescriptions.zarinpal",
    defaultApiUrl: "https://api.zarinpal.com",
  },
  {
    kind: "tabapay",
    labelKey: "providerKinds.tabapay",
    descriptionKey: "providerDescriptions.tabapay",
    defaultApiUrl: "https://api.tabapay.ir",
  },
  {
    kind: "zibal",
    labelKey: "providerKinds.zibal",
    descriptionKey: "providerDescriptions.zibal",
    defaultApiUrl: "https://gateway.zibal.ir",
  },
  {
    kind: "idpay",
    labelKey: "providerKinds.idpay",
    descriptionKey: "providerDescriptions.idpay",
    defaultApiUrl: "https://api.idpay.ir",
  },
  {
    kind: "nextpay",
    labelKey: "providerKinds.nextpay",
    descriptionKey: "providerDescriptions.nextpay",
    defaultApiUrl: "https://api.nextpay.org",
  },
  {
    kind: "mellat",
    labelKey: "providerKinds.mellat",
    descriptionKey: "providerDescriptions.mellat",
    defaultApiUrl: "https://bpm.shaparak.ir",
  },
  {
    kind: "parsian",
    labelKey: "providerKinds.parsian",
    descriptionKey: "providerDescriptions.parsian",
    defaultApiUrl: "https://pec.shaparak.ir",
  },
  {
    kind: "fake",
    labelKey: "providerKinds.fake",
    descriptionKey: "providerDescriptions.fake",
    defaultApiUrl: "https://fake.local",
  },
] as const;

export function getPaymentProviderOption(kind: PaymentProviderKind): PaymentProviderOption {
  return (
    PAYMENT_PROVIDER_OPTIONS.find((option) => option.kind === kind) ??
    PAYMENT_PROVIDER_OPTIONS[PAYMENT_PROVIDER_OPTIONS.length - 1]
  );
}
