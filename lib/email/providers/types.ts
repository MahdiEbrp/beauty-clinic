import type { EmailEncryption, EmailProviderKind } from "@/src/db/schema";

export type EmailProviderConfig = {
  kind: EmailProviderKind;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: EmailEncryption;
  fromEmail?: string | null;
  fromName?: string | null;
};

export type EmailSendInput = {
  recipients: string[];
  subject: string;
  message: string;
  templateType: "plain" | "html";
  fromEmail?: string | null;
};

export type EmailAcceptedMessage = {
  recipient: string;
  providerMessageId?: string;
  providerStatus?: string;
};

export type EmailRejectedMessage = {
  recipient: string;
  code: string;
  message: string;
};

export type EmailSendResult = {
  accepted: EmailAcceptedMessage[];
  rejected: EmailRejectedMessage[];
  statusCode: number;
  providerStatus?: string;
};

export type EmailProviderAdapter = {
  send(input: EmailSendInput): Promise<EmailSendResult>;
};

export class EmailProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "EmailProviderError";
  }
}