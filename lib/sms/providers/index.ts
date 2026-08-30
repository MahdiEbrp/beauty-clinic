import type { SmsProviderKind } from "@/src/db/schema";
import { createGenericAdapter } from "./generic";
import { createKavenegarAdapter } from "./kavenegar";
import type { SmsProviderAdapter, SmsProviderConfig } from "./types";

export type {
  SmsAcceptedMessage,
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsSendInput,
  SmsSendResult,
} from "./types";
export { SmsProviderError } from "./types";

export function createSmsProviderAdapter(
  config: SmsProviderConfig,
): SmsProviderAdapter {
  const factory = PROVIDER_FACTORIES[config.kind] ?? createGenericAdapter;
  return factory(config);
}

const PROVIDER_FACTORIES: Record<
  SmsProviderKind,
  (config: SmsProviderConfig) => SmsProviderAdapter
> = {
  kavenegar: createKavenegarAdapter,
  sms_ir: createGenericAdapter,
  ippanel: createGenericAdapter,
  melipayamak: createGenericAdapter,
  custom: createGenericAdapter,
};
