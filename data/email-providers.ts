import type { EmailEncryption, EmailProviderKind } from "@/src/db/schema";

export type EmailProviderOption = {
  kind: EmailProviderKind;
  labelKey: string;
  descriptionKey: string;
  defaultHost: string;
  defaultPort: number;
  defaultEncryption: EmailEncryption;
};

export const EMAIL_PROVIDER_OPTIONS: readonly EmailProviderOption[] = [
  {
    kind: "gmail",
    labelKey: "providerKinds.gmail",
    descriptionKey: "providerDescriptions.gmail",
    defaultHost: "smtp.gmail.com",
    defaultPort: 465,
    defaultEncryption: "ssl",
  },
  {
    kind: "outlook",
    labelKey: "providerKinds.outlook",
    descriptionKey: "providerDescriptions.outlook",
    defaultHost: "smtp-mail.outlook.com",
    defaultPort: 587,
    defaultEncryption: "starttls",
  },
  {
    kind: "yahoo",
    labelKey: "providerKinds.yahoo",
    descriptionKey: "providerDescriptions.yahoo",
    defaultHost: "smtp.mail.yahoo.com",
    defaultPort: 465,
    defaultEncryption: "ssl",
  },
  {
    kind: "custom",
    labelKey: "providerKinds.custom",
    descriptionKey: "providerDescriptions.custom",
    defaultHost: "",
    defaultPort: 465,
    defaultEncryption: "ssl",
  },
  {
    kind: "liara",
    labelKey: "providerKinds.liara",
    descriptionKey: "providerDescriptions.liara",
    defaultHost: "https://mail-service.liara.ir/api/v1/mails",
    defaultPort: 443,
    defaultEncryption: "ssl",
  },
  {
    kind: "fake",
    labelKey: "providerKinds.fake",
    descriptionKey: "providerDescriptions.fake",
    defaultHost: "smtp.fake.local",
    defaultPort: 465,
    defaultEncryption: "none",
  },
] as const;

export function getEmailProviderOption(
  kind: EmailProviderKind,
): EmailProviderOption {
  return (
    EMAIL_PROVIDER_OPTIONS.find((option) => option.kind === kind) ??
    EMAIL_PROVIDER_OPTIONS[EMAIL_PROVIDER_OPTIONS.length - 1]
  );
}