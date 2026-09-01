import type { SmsProviderKind } from "@/src/db/schema";
import { createGenericAdapter } from "./generic";
import { createKavenegarAdapter } from "./kavenegar";
import { createSmsIrAdapter } from "./sms-ir";
import type { SmsProviderAdapter, SmsProviderConfig } from "./types";

export type {
  SmsAcceptedMessage,
  SmsMessageReport,
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsReceivedMessage,
  SmsSendInput,
  SmsSendResult,
  SmsVerifyInput,
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
  sms_ir: createSmsIrAdapter,
  ippanel: createGenericAdapter,
  melipayamak: createGenericAdapter,
  custom: createGenericAdapter,
};
