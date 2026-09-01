import type { EmailProviderKind } from "@/src/db/schema";
import { createFakeAdapter } from "./fake";
import { createSmtpAdapter } from "./smtp";
import type { EmailProviderAdapter, EmailProviderConfig } from "./types";

export type {
  EmailAcceptedMessage,
  EmailProviderAdapter,
  EmailProviderConfig,
  EmailRejectedMessage,
  EmailSendInput,
  EmailSendResult,
} from "./types";
export { EmailProviderError } from "./types";

export function createEmailProviderAdapter(
  config: EmailProviderConfig,
): EmailProviderAdapter {
  const factory = PROVIDER_FACTORIES[config.kind] ?? createSmtpAdapter;
  return factory(config);
}

const PROVIDER_FACTORIES: Record<
  EmailProviderKind,
  (config: EmailProviderConfig) => EmailProviderAdapter
> = {
  gmail: createSmtpAdapter,
  outlook: createSmtpAdapter,
  yahoo: createSmtpAdapter,
  custom: createSmtpAdapter,
  fake: createFakeAdapter,
};