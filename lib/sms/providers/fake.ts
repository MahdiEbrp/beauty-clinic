import { logInfo } from "@/lib/log";
import type {
  SmsMessageReport,
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsReceivedMessage,
  SmsSendInput,
  SmsSendResult,
  SmsVerifyInput,
} from "./types";

/**
 * Fake / smoke-test provider. It never sends a real message: every operation is
 * logged to the console (server side) and returns a deterministic success, so
 * the SMS send pipeline, campaigns and check/test flows work end-to-end without
 * any external provider or credentials.
 */
export function createFakeAdapter(config: SmsProviderConfig): SmsProviderAdapter {
  return {
    send: (input) => send(config, input),
    sendVerify: (input) => sendVerify(config, input),
    getCredit: () => getCredit(config),
    getLines: () => getLines(config),
    getMessage: (messageId) => getMessage(config, messageId),
    receiveLatest: (count) => receiveLatest(config, count),
  };
}

async function send(
  config: SmsProviderConfig,
  input: SmsSendInput,
): Promise<SmsSendResult> {
  logInfo("sms.fake.send", {
    providerKind: config.kind,
    sender: input.sender ?? config.sender ?? config.credentials.lineNumber ?? null,
    recipients: input.recipients,
    message: input.message,
    acceptedCount: input.recipients.length,
  });

  return {
    accepted: input.recipients.map((recipient) => ({
      recipient,
      providerMessageId: fakeMessageId(recipient),
      providerStatus: "sent",
    })),
    rejected: [],
    statusCode: 200,
    providerStatus: "Simulated send succeeded (no external provider called).",
  };
}

async function sendVerify(
  config: SmsProviderConfig,
  input: SmsVerifyInput,
): Promise<SmsSendResult> {
  logInfo("sms.fake.sendVerify", {
    providerKind: config.kind,
    recipients: input.recipients,
    templateId: input.templateId,
    parameters: input.parameters,
    acceptedCount: input.recipients.length,
  });

  return {
    accepted: input.recipients.map((recipient) => ({
      recipient,
      providerMessageId: fakeMessageId(recipient),
      providerStatus: "sent",
    })),
    rejected: [],
    statusCode: 200,
    providerStatus: "Simulated OTP send succeeded (no external provider called).",
  };
}

async function getCredit(config: SmsProviderConfig): Promise<number> {
  logInfo("sms.fake.getCredit", {
    providerKind: config.kind,
  });
  return 10_000;
}

async function getLines(config: SmsProviderConfig): Promise<string[]> {
  logInfo("sms.fake.getLines", {
    providerKind: config.kind,
  });
  return ["100020003000"];
}

async function getMessage(
  config: SmsProviderConfig,
  messageId: string,
): Promise<SmsMessageReport | null> {
  logInfo("sms.fake.getMessage", {
    providerKind: config.kind,
    messageId,
  });
  return {
    messageId,
    deliveryState: 1,
    statusText: "Simulated delivery report (no external provider called).",
  };
}

async function receiveLatest(
  config: SmsProviderConfig,
  count?: number,
): Promise<SmsReceivedMessage[]> {
  logInfo("sms.fake.receiveLatest", {
    providerKind: config.kind,
    count: count ?? undefined,
  });
  return [];
}

/** Deterministic, greppable fake provider id based on the recipient. */
function fakeMessageId(recipient: string): string {
  return `fake-${Buffer.from(recipient, "utf8").toString("hex").slice(0, 12)}`;
}