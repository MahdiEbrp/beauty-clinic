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

export type SmsVerifyInput = {
  recipients: string[];
  templateId: number;
  parameters: Array<{ name: string; value: string }>;
};

export type SmsMessageReport = {
  messageId: string;
  deliveryState: number;
  statusText?: string;
  cost?: number;
  text?: string;
};

export type SmsReceivedMessage = {
  receiveReturnId: string;
  messageText: string;
  number: string;
  mobile: string;
  receivedDateTime?: number;
};

export type SmsProviderAdapter = {
  send(input: SmsSendInput): Promise<SmsSendResult>;
  /** SMS.ir OTP verification (server-renders the template). Optional in other adapters. */
  sendVerify?(input: SmsVerifyInput): Promise<SmsSendResult>;
  /** Provider account credit. */
  getCredit?(): Promise<number>;
  /** Provider active sender lines. */
  getLines?(): Promise<string[]>;
  /** Single-message delivery report. */
  getMessage?(messageId: string): Promise<SmsMessageReport | null>;
  /** Latest received messages (SMS.ir marks them read after retrieval). */
  receiveLatest?(count?: number): Promise<SmsReceivedMessage[]>;
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
