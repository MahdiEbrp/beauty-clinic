import type { AdminEmailProvider } from "@/lib/email/provider-service";
import type { EmailEncryption } from "@/src/db/schema";

export type EmailProviderFormState = {
  name: string;
  kind: AdminEmailProvider["kind"];
  host: string;
  port: string;
  encryption: EmailEncryption;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  isDefault: boolean;
};

export type EmailProviderFormSetter = <K extends keyof EmailProviderFormState>(
  key: K,
  value: EmailProviderFormState[K],
) => void;