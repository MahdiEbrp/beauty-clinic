import type { AdminPaymentProvider } from "@/lib/payment/provider-service";

export type PaymentProviderFormState = {
  name: string;
  kind: AdminPaymentProvider["kind"];
  apiUrl: string;
  merchantId: string;
  callbackUrl: string;
  sandbox: boolean;
  isActive: boolean;
  isDefault: boolean;
};

export type PaymentProviderFormSetter = <K extends keyof PaymentProviderFormState>(
  key: K,
  value: PaymentProviderFormState[K],
) => void;
