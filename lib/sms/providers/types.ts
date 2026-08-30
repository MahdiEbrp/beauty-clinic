import type { SmsProviderKind } from "@/src/db/schema";
import type { SmsProviderCredentials } from "@/lib/sms/crypto";

export type SmsProviderConfig = {
  kind: SmsProviderKind;
  apiUrl: string;
  token: string;
  credentials: SmsProviderCredentials;
  sender?: string | null;
};

export type SmsSendInput = {
  recipients: string[];
  message: string;
  sender?: string | null;
};

export type SmsAcceptedMessage = {
  recipient: string;
  providerMessageId?: string;
  providerStatus?: string;
  cost?: number;
};

export type SmsRejectedMessage = {
  recipient: string;
  code: string;
  message: string;
};

export type SmsSendResult = {
  accepted: SmsAcceptedMessage[];
  rejected: SmsRejectedMessage[];
  statusCode: number;
  providerStatus?: string;
};

export type SmsProviderAdapter = {
  send(input: SmsSendInput): Promise<SmsSendResult>;
};

export class SmsProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "SmsProviderError";
  }
}
