import { createFakeAdapter } from "./fake";
import { createGenericAdapter } from "./generic";
import { createTabapayAdapter } from "./tabapay";
import { createZarinpalAdapter } from "./zarinpal";
import type { PaymentProviderAdapter, PaymentProviderConfig } from "./types";

const FACTORIES: Record<string, (c: PaymentProviderConfig) => PaymentProviderAdapter> = {
  zarinpal: createZarinpalAdapter,
  tabapay: createTabapayAdapter,
  zibal: createGenericAdapter,
  idpay: createGenericAdapter,
  nextpay: createGenericAdapter,
  mellat: createGenericAdapter,
  parsian: createGenericAdapter,
  fake: createFakeAdapter,
};

export function createPaymentProviderAdapter(config: PaymentProviderConfig): PaymentProviderAdapter {
  const factory = FACTORIES[config.kind] ?? createGenericAdapter;
  return factory(config);
}
