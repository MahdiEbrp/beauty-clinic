import { logInfo } from "@/lib/log";
import { createZarinpalAdapter } from "./zarinpal";
import type { PaymentProviderAdapter, PaymentProviderConfig } from "./types";

// Generic fallback for other gateways — delegates to ZarinPal-like REST for now.
export function createGenericAdapter(config: PaymentProviderConfig): PaymentProviderAdapter {
  logInfo("payment.generic.adapter", { kind: config.kind, apiUrl: config.apiUrl });
  return createZarinpalAdapter(config);
}
