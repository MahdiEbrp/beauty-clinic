import { SMS_PROVIDER_HTTP, SMS_PROVIDER_PROTOCOL } from "@/lib/sms/constants";
import { requestProvider } from "./http";
import { asArray, asRecord, readNumber, readString } from "./parsing";
import type {
  SmsMessageReport,
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsReceivedMessage,
  SmsSendInput,
  SmsSendResult,
  SmsVerifyInput,
} from "./types";
import { SmsProviderError } from "./types";

const { smsIr } = SMS_PROVIDER_PROTOCOL;

// SMS.ir vouches results with a numeric `status` field (1 = success). The body
// carries a `data` field whose shape depends on the endpoint. See
// https://docs.sms.ir/v1 for the authoritative reference.
export function createSmsIrAdapter(config: SmsProviderConfig): SmsProviderAdapter {
  return {
    send: (input) => sendBulk(config, input),
    sendVerify: (input) => sendVerify(config, input),
    getCredit: () => getCredit(config),
    getLines: () => getLines(config),
    getMessage: (messageId) => getMessage(config, messageId),
    receiveLatest: (count) => receiveLatest(config, count),
  };
}

async function sendBulk(
  config: SmsProviderConfig,
  input: SmsSendInput,
): Promise<SmsSendResult> {
  const sender = input.sender ?? config.sender ?? config.credentials.lineNumber;
  const accepted: SmsSendResult["accepted"] = [];

  // SMS.ir allows at most `maxMobilesPerBulk` recipients per request, so a large
  // audience is split into sequential batches and the results are aggregated.
  const chunkSize = smsIr.maxMobilesPerBulk;
  for (let offset = 0; offset < input.recipients.length; offset += chunkSize) {
    const chunk = input.recipients.slice(offset, offset + chunkSize);
    const data = await callApi(config, smsIr.bulkPath, {
      method: "POST",
      body: JSON.stringify({
        [smsIr.lineNumberField]: sender,
        [smsIr.messageTextField]: input.message,
        [smsIr.mobilesField]: chunk,
      }),
    });
    const record = asRecord(data);
    const messageIds = asArray(record?.messageIds).map(readRawId);
    chunk.forEach((recipient, index) => {
      accepted.push({
        recipient,
        providerMessageId: messageIds[index],
        providerStatus: "queued",
        cost: readNumber(record, "cost"),
      });
    });
  }

  return { accepted, rejected: [], statusCode: 200 };
}

/** OTP/verify is per-recipient and server-rendered by SMS.ir; send one per mobile. */
async function sendVerify(
  config: SmsProviderConfig,
  input: SmsVerifyInput,
): Promise<SmsSendResult> {
  const accepted: SmsSendResult["accepted"] = [];
  for (const recipient of input.recipients) {
    const data = await callApi(config, smsIr.verifyPath, {
      method: "POST",
      body: JSON.stringify({
        mobile: recipient,
        templateId: input.templateId,
        parameters: input.parameters,
      }),
    });
    const record = asRecord(data);
    accepted.push({
      recipient,
      providerMessageId: readRawId(readNumber(record, "messageId")),
      providerStatus: "queued",
      cost: readNumber(record, "cost"),
    });
  }
  return { accepted, rejected: [], statusCode: 200 };
}

/** Current account credit. */
async function getCredit(config: SmsProviderConfig): Promise<number> {
  const data = await callApi(config, smsIr.getCreditPath, {});
  return typeof data === "number" ? data : 0;
}

/** Active sender line numbers. */
async function getLines(config: SmsProviderConfig): Promise<string[]> {
  const data = await callApi(config, smsIr.getLinesPath, {});
  return asArray(data)
    .map(readRawId)
    .filter((id): id is string => Boolean(id));
}

/** Single-message delivery report. */
async function getMessage(
  config: SmsProviderConfig,
  messageId: string,
): Promise<SmsMessageReport | null> {
  const data = await callApi(config, `${smsIr.getMessagePath}${messageId}`, {});
  const record = asRecord(data);
  const deliveryState = readNumber(record, "deliveryState");
  if (!record || deliveryState === undefined) return null;
  return {
    messageId,
    deliveryState,
    statusText: readString(record, "statusText", "status"),
    cost: readNumber(record, "cost"),
    text: readString(record, "text"),
  };
}

/**
 * Retrieve the latest received messages. SMS.ir marks them read after retrieval,
 * so a message is never returned again by this endpoint.
 */
async function receiveLatest(
  config: SmsProviderConfig,
  count = 100,
): Promise<SmsReceivedMessage[]> {
  const data = await callApi(config, smsIr.getLatestReceivedPath, {
    query: { count: String(count) },
  });
  const items: SmsReceivedMessage[] = [];
  for (const item of asArray(data)) {
    const record = asRecord(item);
    if (!record) continue;
    items.push({
      receiveReturnId: readRawId(readNumber(record, "receiveReturnId")) ?? "",
      messageText: readString(record, "messageText", "text") ?? "",
      number: readRawId(readNumber(record, "number")) ?? "",
      mobile: readRawId(readNumber(record, "mobile")) ?? "",
      ...(readNumber(record, "receivedDateTime") !== undefined
        ? { receivedDateTime: readNumber(record, "receivedDateTime") }
        : {}),
    });
  }
  return items;
}

/** Perform a request and return the `data` field on success. */
async function callApi(
  config: SmsProviderConfig,
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: string;
    query?: Record<string, string>;
  },
): Promise<unknown> {
  const url = new URL(resolveEndpoint(config.apiUrl, path));
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }
  const response = await requestProvider(url.toString(), {
    method: options.method ?? "GET",
    headers: buildAuthHeader(config.token),
    ...(options.body !== undefined ? { body: options.body } : {}),
  });
  const root = asRecord(response.body);
  const status = readNumber(root, "status");
  if (status !== 1) {
    throw new SmsProviderError(
      statusMessage(status),
      "PROVIDER_REJECTED",
      response.statusCode,
      false,
    );
  }
  return root?.data;
}

function buildAuthHeader(token: string): Record<string, string> {
  return {
    "content-type": SMS_PROVIDER_HTTP.jsonContentType,
    [smsIr.apiKeyHeader]: token,
  };
}

/** Keep raw value (number → string) so numeric ids stay parseable. */
function readRawId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

/**
 * Accept a base URL (`https://api.sms.ir/v1`), a full endpoint, or a URL that
 * already contains a `/send/` sub-path (older stored providers) and produce the
 * exact endpoint for `path`.
 */
export function resolveEndpoint(apiUrl: string, path: string): string {
  const base = apiUrl.trim().replace(/\/+$/, "");
  if (base.endsWith(path)) return base;
  const sendIndex = base.indexOf("/send/");
  if (sendIndex !== -1) return `${base.slice(0, sendIndex)}${path}`;
  return `${base}${path}`;
}

/** Human-readable description for an SMS.ir operation/status code. */
export function statusMessage(status: number | undefined): string {
  if (status === undefined) return "The SMS provider rejected the request.";
  return (
    SMS_IR_STATUS_MESSAGES[status] ??
    `The SMS provider rejected the request (code ${status}).`
  );
}

const SMS_IR_STATUS_MESSAGES: Record<number, string> = {
  0: "The request encountered an error.",
  10: "Invalid API key.",
  11: "Inactive API key.",
  12: "The API key is restricted to specific IP addresses.",
  13: "The account is inactive.",
  14: "The account is suspended.",
  15: "A plan upgrade is required to use this web service.",
  16: "Invalid parameter value.",
  20: "Rate limit exceeded. Please try again later.",
  101: "Invalid line number.",
  102: "Insufficient credit.",
  103: "The message text is empty.",
  104: "The message contains an invalid mobile number.",
  105: "The number of mobiles exceeds the allowed limit (max 100).",
  106: "The number of message texts exceeds the allowed limit (max 100).",
  107: "The list of mobile numbers is empty.",
  108: "The list of message texts is empty.",
  109: "Invalid scheduled dispatch time.",
  110: "The number of mobile numbers does not match the number of message texts.",
  111: "No send record found with this ID.",
  112: "No record found to delete.",
  113: "Template not found.",
  114: "A parameter value exceeds the allowed length (max 25 characters).",
  115: "One or more mobile numbers are on the system blacklist.",
  116: "One or more required template parameters are not set.",
  117: "The message content is not approved.",
  118: "The number of messages exceeds the allowed limit.",
  119: "A plan upgrade is required to use custom templates.",
  123: "The sender line requires activation.",
  124: "Only OTP messages are allowed; this template is not designated as OTP.",
};
