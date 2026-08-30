import type { AdminSmsProvider } from "@/lib/sms/provider-service";

export type SmsProviderFormState = {
  name: string;
  kind: AdminSmsProvider["kind"];
  apiUrl: string;
  token: string;
  sender: string;
  authScheme: "bearer" | "x-api-key" | "token" | "none";
  authHeader: string;
  lineNumber: string;
  payloadMode: "standard" | "bulk";
  username: string;
  password: string;
  apiKey: string;
  isActive: boolean;
  isDefault: boolean;
};

export type SmsProviderFormSetter = <K extends keyof SmsProviderFormState>(
  key: K,
  value: SmsProviderFormState[K],
) => void;
