import { requestProvider } from "./http";
import { SMS_PROVIDER_HTTP, SMS_PROVIDER_PROTOCOL } from "@/lib/sms/constants";
import { asRecord, nestedRecord, readBoolean, readString } from "./parsing";
import type {
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsSendInput,
  SmsSendResult,
} from "./types";
import { SmsProviderError } from "./types";

export function createGenericAdapter(config: SmsProviderConfig): SmsProviderAdapter {
  return {
    send: (input) => sendGeneric(config, input),
  };
}

async function sendGeneric(
  config: SmsProviderConfig,
  input: SmsSendInput,
): Promise<SmsSendResult> {
  const headers = new Headers({ "content-type": SMS_PROVIDER_HTTP.jsonContentType });
  const authScheme = config.credentials.authScheme ?? "bearer";
  const authHeader = config.credentials.authHeader ?? "Authorization";
  if (authScheme === "bearer") headers.set(authHeader, `${SMS_PROVIDER_HTTP.bearerPrefix} ${config.token}`);
  else if (authScheme === "x-api-key") headers.set(authHeader, config.token);
  else if (authScheme === "token") headers.set(authHeader, config.token);

  const body = buildPayload(config, input);
  const response = await requestProvider(config.apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const root = asRecord(response.body);
  const data = nestedRecord(root, "data");
  const successful =
    readBoolean(root, "success", "isSuccess", "ok") ??
    readBoolean(data, "success", "isSuccess", "ok");
  if (successful === false) {
    throw new SmsProviderError(
      readString(root, "message", "error", "errorMessage") ??
        "The SMS provider rejected the message.",
      "PROVIDER_REJECTED",
      response.statusCode,
      false,
    );
  }

  const providerMessageId = readString(
    root,
    "messageId",
    "messageid",
    "bulkId",
    "batchId",
    "id",
  ) ?? readString(data, "messageId", "messageid", "bulkId", "batchId", "id");
  const providerStatus = readString(root, "status", "statusText", "message");
  return {
    accepted: input.recipients.map((recipient) => ({
      recipient,
      providerMessageId,
      providerStatus,
    })),
    rejected: [],
    statusCode: response.statusCode,
  };
}

function buildPayload(
  config: SmsProviderConfig,
  input: SmsSendInput,
): Record<string, unknown> {
  const sender = input.sender ?? config.sender ?? config.credentials.lineNumber;
  if (config.kind === "sms_ir") {
    return {
      lineNumber: sender,
      messageText: input.message,
      mobiles: input.recipients,
    };
  }
  if (config.kind === "ippanel") {
    return {
      [SMS_PROVIDER_PROTOCOL.ippanel.sendingTypeField]: SMS_PROVIDER_PROTOCOL.ippanel.sendingType,
      [SMS_PROVIDER_PROTOCOL.ippanel.fromNumberField]: sender,
      [SMS_PROVIDER_PROTOCOL.ippanel.messageField]: input.message,
      [SMS_PROVIDER_PROTOCOL.ippanel.recipientsField]: input.recipients,
    };
  }
  if (config.kind === "melipayamak") {
    return {
      username: config.credentials.username,
      password: config.credentials.password,
      from: sender,
      to: input.recipients.join(","),
      text: input.message,
      token: config.token,
    };
  }
  return {
    from: sender,
    to: input.recipients,
    message: input.message,
    token: config.token,
  };
}
