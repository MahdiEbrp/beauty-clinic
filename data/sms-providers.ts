import type { SmsProviderKind } from "@/src/db/schema";

export type SmsProviderOption = {
  kind: SmsProviderKind;
  labelKey: string;
  descriptionKey: string;
  defaultApiUrl: string;
};

export const SMS_PROVIDER_OPTIONS: readonly SmsProviderOption[] = [
  {
    kind: "kavenegar",
    labelKey: "providerKinds.kavenegar",
    descriptionKey: "providerDescriptions.kavenegar",
    defaultApiUrl: "https://api.kavenegar.com",
  },
  {
    kind: "sms_ir",
    labelKey: "providerKinds.smsIr",
    descriptionKey: "providerDescriptions.smsIr",
    defaultApiUrl: "https://api.sms.ir/v1",
  },
  {
    kind: "ippanel",
    labelKey: "providerKinds.ippanel",
    descriptionKey: "providerDescriptions.ippanel",
    defaultApiUrl: "https://edge.ippanel.com/v1/api/send",
  },
  {
    kind: "melipayamak",
    labelKey: "providerKinds.melipayamak",
    descriptionKey: "providerDescriptions.melipayamak",
    defaultApiUrl: "https://rest.payamak-panel.com/api/SendSMS/SendSMS",
  },
  {
    kind: "custom",
    labelKey: "providerKinds.custom",
    descriptionKey: "providerDescriptions.custom",
    defaultApiUrl: "",
  },
] as const;

/**
 * Header scheme the UI presents for a provider kind. SMS.ir authenticates with
 * `x-api-key` (its adapter enforces this regardless of stored settings), while
 * the other providers default to a bearer token.
 */
export function getSmsProviderDefaultAuthScheme(
  kind: SmsProviderKind,
): "bearer" | "x-api-key" | "token" | "none" {
  return kind === "sms_ir" ? "x-api-key" : "bearer";
}

export function getSmsProviderOption(kind: SmsProviderKind): SmsProviderOption {
  return (
    SMS_PROVIDER_OPTIONS.find((option) => option.kind === kind) ??
    SMS_PROVIDER_OPTIONS[SMS_PROVIDER_OPTIONS.length - 1]
  );
}
